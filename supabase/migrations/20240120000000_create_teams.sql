-- Migration: Create Teams System
-- Description: Tables for team-based authentication with team codes

-- ============================================
-- 0. PROFILES TABLE (prerequisite)
-- ============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- NOTE: Policy for viewing teammate profiles is added after team_members table is created (see below)

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
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
-- 1. TABLES
-- ============================================

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);

-- Team members junction table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('leader', 'member')) DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

-- Indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);

-- Calendar entries table (replaces localStorage)
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

-- Indexes for calendar_entries
CREATE INDEX IF NOT EXISTS idx_calendar_entries_team_date ON public.calendar_entries(team_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_user ON public.calendar_entries(user_id);

-- Add current_team_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- ============================================
-- 2. FUNCTIONS
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

    -- Check if code already exists
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

-- Trigger for team code generation
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

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_teams_updated_at ON public.teams;
CREATE TRIGGER trigger_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_calendar_entries_updated_at ON public.calendar_entries;
CREATE TRIGGER trigger_calendar_entries_updated_at
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- ----- TEAMS POLICIES -----

-- Anyone can view a team by code (for joining)
CREATE POLICY "Anyone can view team by code"
  ON public.teams FOR SELECT
  USING (true);

-- Team members can view their team details
CREATE POLICY "Team members can view their team"
  ON public.teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Leaders can update their team
CREATE POLICY "Leaders can update their team"
  ON public.teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- Leaders can delete their team
CREATE POLICY "Leaders can delete their team"
  ON public.teams FOR DELETE
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ----- PROFILES POLICY (now that team_members exists) -----

-- Team members can view profiles of their teammates
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

-- Members can view other members of their team
CREATE POLICY "View team members"
  ON public.team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can join teams (insert themselves)
CREATE POLICY "Users can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can leave teams (delete themselves)
CREATE POLICY "Users can leave teams"
  ON public.team_members FOR DELETE
  USING (user_id = auth.uid());

-- Leaders can remove members from their team
CREATE POLICY "Leaders can remove members"
  ON public.team_members FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- Leaders can update member roles
CREATE POLICY "Leaders can update member roles"
  ON public.team_members FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- ----- CALENDAR ENTRIES POLICIES -----

-- Team members can view all calendar entries for their team
CREATE POLICY "View team calendar"
  ON public.calendar_entries FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can manage their own calendar entries
CREATE POLICY "Manage own calendar entries"
  ON public.calendar_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own calendar entries"
  ON public.calendar_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Delete own calendar entries"
  ON public.calendar_entries FOR DELETE
  USING (user_id = auth.uid());

-- Leaders can manage all team calendar entries
CREATE POLICY "Leaders manage team calendar"
  ON public.calendar_entries FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- ============================================
-- 4. HELPER FUNCTIONS FOR API
-- ============================================

-- Get user's current team with role
CREATE OR REPLACE FUNCTION get_user_team(p_user_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  user_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.code,
    tm.role
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
