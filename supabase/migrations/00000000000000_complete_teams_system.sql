-- ============================================
-- MIGRATION ULTIME: Système Complet d'Équipes
-- ============================================
-- Description: Tables, fonctions, triggers et RLS pour le système d'équipes
-- avec gestion des jours de congés par statut (cadre/non-cadre)
--
-- À exécuter sur une base de données fraîche ou via Supabase Dashboard
-- ============================================

-- ============================================
-- 0. PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  current_team_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 1. TEAMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  sector TEXT CHECK (sector IN ('public', 'private')) DEFAULT 'public' NOT NULL,
  default_leave_days_employee INTEGER DEFAULT 25 NOT NULL,
  default_leave_days_executive INTEGER DEFAULT 25 NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT teams_leave_days_employee_check CHECK (default_leave_days_employee >= 0 AND default_leave_days_employee <= 60),
  CONSTRAINT teams_leave_days_executive_check CHECK (default_leave_days_executive >= 0 AND default_leave_days_executive <= 60)
);

CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);

COMMENT ON COLUMN public.teams.default_leave_days_employee IS 'Jours de congés annuels par défaut pour les non-cadres';
COMMENT ON COLUMN public.teams.default_leave_days_executive IS 'Jours de congés annuels par défaut pour les cadres';
COMMENT ON COLUMN public.teams.sector IS 'Secteur: public ou private';

-- ============================================
-- 2. TEAM MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('leader', 'member')) DEFAULT 'member' NOT NULL,
  employee_type TEXT CHECK (employee_type IN ('employee', 'executive')) DEFAULT 'employee' NOT NULL,
  annual_leave_days INTEGER DEFAULT 25 NOT NULL,
  leave_balance INTEGER DEFAULT 25 NOT NULL,
  leave_balance_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);

COMMENT ON COLUMN public.team_members.employee_type IS 'Statut: employee (non-cadre) ou executive (cadre)';
COMMENT ON COLUMN public.team_members.annual_leave_days IS 'Jours de congés annuels attribués';
COMMENT ON COLUMN public.team_members.leave_balance IS 'Solde de congés restant';

-- Add foreign key for current_team_id in profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_current_team_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_current_team_id_fkey
  FOREIGN KEY (current_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- ============================================
-- 3. CALENDAR ENTRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('WORK', 'REMOTE', 'SCHOOL', 'TRAINER', 'LEAVE', 'HOLIDAY', 'OFF')) NOT NULL,
  half_day TEXT CHECK (half_day IN ('AM', 'PM', 'FULL')) DEFAULT 'FULL',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id, date, half_day)
);

CREATE INDEX IF NOT EXISTS idx_calendar_entries_team_date ON public.calendar_entries(team_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_user ON public.calendar_entries(user_id);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Generate unique 8-character team code
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.teams WHERE code = result) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate team code
CREATE OR REPLACE FUNCTION set_team_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_team_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_team_code ON public.teams;
CREATE TRIGGER trigger_set_team_code
  BEFORE INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION set_team_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_teams_updated_at ON public.teams;
CREATE TRIGGER trigger_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_calendar_entries_updated_at ON public.calendar_entries;
CREATE TRIGGER trigger_calendar_entries_updated_at
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Get default leave days by employee type
CREATE OR REPLACE FUNCTION get_default_leave_days(
  p_team_id UUID,
  p_employee_type TEXT DEFAULT 'employee'
)
RETURNS INTEGER AS $$
DECLARE
  v_leave_days INTEGER;
BEGIN
  IF p_employee_type = 'executive' THEN
    SELECT default_leave_days_executive INTO v_leave_days
    FROM public.teams WHERE id = p_team_id;
  ELSE
    SELECT default_leave_days_employee INTO v_leave_days
    FROM public.teams WHERE id = p_team_id;
  END IF;
  RETURN COALESCE(v_leave_days, 25);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_default_leave_days TO authenticated;

-- Get user's current team with role
CREATE OR REPLACE FUNCTION get_user_team(p_user_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  user_role TEXT,
  employee_type TEXT,
  annual_leave_days INTEGER,
  leave_balance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.code,
    tm.role,
    tm.employee_type,
    tm.annual_leave_days,
    tm.leave_balance
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_team TO authenticated;

-- Check if user has a team
CREATE OR REPLACE FUNCTION user_has_team(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.team_members
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION user_has_team TO authenticated;

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- ----- TEAMS POLICIES -----

DROP POLICY IF EXISTS "Anyone can view team by code" ON public.teams;
CREATE POLICY "Anyone can view team by code"
  ON public.teams FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Leaders can update their team" ON public.teams;
CREATE POLICY "Leaders can update their team"
  ON public.teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

DROP POLICY IF EXISTS "Leaders can delete their team" ON public.teams;
CREATE POLICY "Leaders can delete their team"
  ON public.teams FOR DELETE
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ----- PROFILES POLICIES -----

DROP POLICY IF EXISTS "Team members can view teammate profiles" ON public.profiles;
CREATE POLICY "Team members can view teammate profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT tm2.user_id FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
    )
  );

-- ----- TEAM MEMBERS POLICIES -----

DROP POLICY IF EXISTS "View team members" ON public.team_members;
CREATE POLICY "View team members"
  ON public.team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
CREATE POLICY "Users can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can leave teams" ON public.team_members;
CREATE POLICY "Users can leave teams"
  ON public.team_members FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Leaders can remove members" ON public.team_members;
CREATE POLICY "Leaders can remove members"
  ON public.team_members FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

DROP POLICY IF EXISTS "Leaders can update member roles" ON public.team_members;
CREATE POLICY "Leaders can update member roles"
  ON public.team_members FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- ----- CALENDAR ENTRIES POLICIES -----

DROP POLICY IF EXISTS "View team calendar" ON public.calendar_entries;
CREATE POLICY "View team calendar"
  ON public.calendar_entries FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Manage own calendar entries" ON public.calendar_entries;
CREATE POLICY "Manage own calendar entries"
  ON public.calendar_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own calendar entries" ON public.calendar_entries;
CREATE POLICY "Update own calendar entries"
  ON public.calendar_entries FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own calendar entries" ON public.calendar_entries;
CREATE POLICY "Delete own calendar entries"
  ON public.calendar_entries FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Leaders manage team calendar" ON public.calendar_entries;
CREATE POLICY "Leaders manage team calendar"
  ON public.calendar_entries FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
