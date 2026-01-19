-- ============================================
-- PGVDIM - CONSOLIDATED MIGRATION SCRIPT
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Copy and paste THIS ENTIRE FILE
-- 4. Run the query
--
-- This script is IDEMPOTENT - safe to run multiple times
-- Last updated: 2024-01-27
--
-- ============================================

-- Start transaction
BEGIN;

-- ============================================
-- MIGRATION 1: PROFILES TABLE
-- ============================================

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (drop if exist first)
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

-- Handle new user signup (will be updated later with birth_date)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MIGRATION 2: TEAMS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('leader', 'member')) DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);

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

-- Add current_team_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- Team code generator
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

-- Updated at function
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

-- ============================================
-- MIGRATION 3: FIX RLS RECURSION (Helper Functions)
-- ============================================

CREATE OR REPLACE FUNCTION get_user_team_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT team_id FROM public.team_members
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_team_leader(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.team_members
    WHERE user_id = p_user_id
    AND team_id = p_team_id
    AND role = 'leader'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_leader_team_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT team_id FROM public.team_members
  WHERE user_id = p_user_id AND role = 'leader';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old policies and recreate
DROP POLICY IF EXISTS "View team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON public.team_members;
DROP POLICY IF EXISTS "Leaders can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Leaders can update member roles" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their team" ON public.teams;
DROP POLICY IF EXISTS "Leaders can update their team" ON public.teams;
DROP POLICY IF EXISTS "Leaders can delete their team" ON public.teams;
DROP POLICY IF EXISTS "Anyone can view team by code" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
DROP POLICY IF EXISTS "View team calendar" ON public.calendar_entries;
DROP POLICY IF EXISTS "Manage own calendar entries" ON public.calendar_entries;
DROP POLICY IF EXISTS "Update own calendar entries" ON public.calendar_entries;
DROP POLICY IF EXISTS "Delete own calendar entries" ON public.calendar_entries;
DROP POLICY IF EXISTS "Leaders manage team calendar" ON public.calendar_entries;
DROP POLICY IF EXISTS "Team members can view teammate profiles" ON public.profiles;

-- Team members policies
CREATE POLICY "View team members"
  ON public.team_members FOR SELECT
  USING (team_id IN (SELECT get_user_team_ids(auth.uid())));

CREATE POLICY "Users can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave teams"
  ON public.team_members FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Leaders can remove members"
  ON public.team_members FOR DELETE
  USING (team_id IN (SELECT get_user_leader_team_ids(auth.uid())));

CREATE POLICY "Leaders can update member roles"
  ON public.team_members FOR UPDATE
  USING (team_id IN (SELECT get_user_leader_team_ids(auth.uid())));

-- Teams policies
CREATE POLICY "Anyone can view team by code"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Team members can view their team"
  ON public.teams FOR SELECT
  USING (id IN (SELECT get_user_team_ids(auth.uid())));

CREATE POLICY "Leaders can update their team"
  ON public.teams FOR UPDATE
  USING (id IN (SELECT get_user_leader_team_ids(auth.uid())));

CREATE POLICY "Leaders can delete their team"
  ON public.teams FOR DELETE
  USING (id IN (SELECT get_user_leader_team_ids(auth.uid())));

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Calendar entries policies
CREATE POLICY "View team calendar"
  ON public.calendar_entries FOR SELECT
  USING (team_id IN (SELECT get_user_team_ids(auth.uid())));

CREATE POLICY "Manage own calendar entries"
  ON public.calendar_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own calendar entries"
  ON public.calendar_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Delete own calendar entries"
  ON public.calendar_entries FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Leaders manage team calendar"
  ON public.calendar_entries FOR ALL
  USING (team_id IN (SELECT get_user_leader_team_ids(auth.uid())));

-- Profiles policy
CREATE POLICY "Team members can view teammate profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT tm.user_id
      FROM public.team_members tm
      WHERE tm.team_id IN (SELECT get_user_team_ids(auth.uid()))
    )
  );

-- ============================================
-- MIGRATION 4: LEAVE MANAGEMENT
-- ============================================

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS employee_type TEXT DEFAULT 'employee' NOT NULL;

-- Add check constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_employee_type_check'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_employee_type_check
      CHECK (employee_type IN ('employee', 'executive'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS annual_leave_days INTEGER DEFAULT 25 NOT NULL;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_balance INTEGER DEFAULT 25 NOT NULL;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_balance_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER NOT NULL;

CREATE OR REPLACE FUNCTION set_default_leave_days()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_type = 'executive' THEN
    NEW.annual_leave_days := COALESCE(NULLIF(NEW.annual_leave_days, 25), 30);
    NEW.leave_balance := COALESCE(NULLIF(NEW.leave_balance, 25), 30);
  ELSE
    NEW.annual_leave_days := COALESCE(NEW.annual_leave_days, 25);
    NEW.leave_balance := COALESCE(NEW.leave_balance, 25);
  END IF;
  NEW.leave_balance_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_default_leave_days ON public.team_members;
CREATE TRIGGER trigger_set_default_leave_days
  BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION set_default_leave_days();

CREATE OR REPLACE FUNCTION check_and_reset_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
  current_year INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  IF OLD.leave_balance_year < current_year THEN
    NEW.leave_balance := NEW.annual_leave_days;
    NEW.leave_balance_year := current_year;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_leave_reset ON public.team_members;
CREATE TRIGGER trigger_check_leave_reset
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION check_and_reset_leave_balance();

-- Improved leave balance update (atomic)
DROP TRIGGER IF EXISTS trigger_update_leave_balance ON public.calendar_entries;

CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
  days_to_deduct NUMERIC;
  entry_year INTEGER;
BEGIN
  IF NEW.status != 'LEAVE' THEN
    RETURN NEW;
  END IF;

  days_to_deduct := CASE
    WHEN NEW.half_day IN ('AM', 'PM') THEN 0.5
    ELSE 1
  END;

  entry_year := EXTRACT(YEAR FROM NEW.date)::INTEGER;

  UPDATE public.team_members
  SET
    leave_balance = CASE
      WHEN leave_balance_year < entry_year THEN annual_leave_days - days_to_deduct
      ELSE GREATEST(0, leave_balance - days_to_deduct)
    END,
    leave_balance_year = CASE
      WHEN leave_balance_year < entry_year THEN entry_year
      ELSE leave_balance_year
    END
  WHERE user_id = NEW.user_id
    AND team_id = NEW.team_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_leave_balance
  AFTER INSERT ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION update_leave_balance();

-- Restore leave balance on delete
CREATE OR REPLACE FUNCTION restore_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
  days_to_restore NUMERIC;
BEGIN
  IF OLD.status = 'LEAVE' THEN
    days_to_restore := CASE
      WHEN OLD.half_day IN ('AM', 'PM') THEN 0.5
      ELSE 1
    END;

    UPDATE public.team_members
    SET leave_balance = leave_balance + days_to_restore
    WHERE user_id = OLD.user_id
      AND team_id = OLD.team_id
      AND leave_balance_year = EXTRACT(YEAR FROM OLD.date)::INTEGER;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_restore_leave_balance ON public.calendar_entries;
CREATE TRIGGER trigger_restore_leave_balance
  AFTER DELETE ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION restore_leave_balance();

-- Leave info helper
CREATE OR REPLACE FUNCTION get_leave_info(p_user_id UUID, p_team_id UUID)
RETURNS TABLE (
  employee_type TEXT,
  annual_leave_days INTEGER,
  leave_balance NUMERIC,
  leave_balance_year INTEGER,
  used_days NUMERIC
) AS $$
DECLARE
  current_year INTEGER;
  member_record RECORD;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  SELECT * INTO member_record
  FROM public.team_members tm
  WHERE tm.user_id = p_user_id AND tm.team_id = p_team_id;

  IF member_record IS NOT NULL THEN
    IF member_record.leave_balance_year < current_year THEN
      RETURN QUERY SELECT
        member_record.employee_type,
        member_record.annual_leave_days,
        member_record.annual_leave_days::NUMERIC,
        current_year,
        0::NUMERIC;
    ELSE
      RETURN QUERY SELECT
        member_record.employee_type,
        member_record.annual_leave_days,
        member_record.leave_balance::NUMERIC,
        member_record.leave_balance_year,
        (member_record.annual_leave_days - member_record.leave_balance)::NUMERIC;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION 5: AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.audit_logs IS 'Audit trail for security-critical operations';

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Leaders can view team audit logs" ON public.audit_logs;
CREATE POLICY "Leaders can view team audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM get_user_leader_team_ids(auth.uid()))
  );

CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata, p_ip_address, p_user_agent)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_audit_log TO authenticated;

-- Audit triggers
CREATE OR REPLACE FUNCTION public.audit_team_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_audit_log(
      NEW.created_by,
      'team.create',
      'team',
      NEW.id,
      jsonb_build_object('name', NEW.name, 'code', NEW.code)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_audit_log(
      auth.uid(),
      'team.delete',
      'team',
      OLD.id,
      jsonb_build_object('name', OLD.name)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_teams_trigger ON public.teams;
CREATE TRIGGER audit_teams_trigger
  AFTER INSERT OR DELETE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.audit_team_changes();

CREATE OR REPLACE FUNCTION public.audit_membership_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_audit_log(
      NEW.user_id,
      'team.join',
      'team_member',
      NEW.id,
      jsonb_build_object('team_id', NEW.team_id, 'role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_audit_log(
      OLD.user_id,
      'team.leave',
      'team_member',
      OLD.id,
      jsonb_build_object('team_id', OLD.team_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_team_members_trigger ON public.team_members;
CREATE TRIGGER audit_team_members_trigger
  AFTER INSERT OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.audit_membership_changes();

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================
-- MIGRATION 6: ARCHITECTURE IMPROVEMENTS
-- ============================================

-- Data validation constraints
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS check_leave_balance_positive;
ALTER TABLE public.team_members
  ADD CONSTRAINT check_leave_balance_positive CHECK (leave_balance >= 0);

ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS check_annual_leave_days_range;
ALTER TABLE public.team_members
  ADD CONSTRAINT check_annual_leave_days_range CHECK (annual_leave_days BETWEEN 0 AND 60);

ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS check_leave_balance_year_valid;
ALTER TABLE public.team_members
  ADD CONSTRAINT check_leave_balance_year_valid CHECK (leave_balance_year >= 2020 AND leave_balance_year <= 2100);

ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS check_team_name_not_empty;
ALTER TABLE public.teams
  ADD CONSTRAINT check_team_name_not_empty CHECK (LENGTH(TRIM(name)) >= 2);

ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS check_team_code_format;
ALTER TABLE public.teams
  ADD CONSTRAINT check_team_code_format CHECK (code ~ '^[A-Z0-9]{8}$');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_team_members_leave_balance ON public.team_members(user_id, leave_balance_year);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_status ON public.calendar_entries(status);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date_range ON public.calendar_entries(team_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Email validation
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_email_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT check_email_format CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$');

-- ============================================
-- MIGRATION 7: SECTOR SUPPORT (Public/Private)
-- ============================================

-- Add sector column to teams
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'public' NOT NULL;

-- Add check constraint for sector
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_sector_check'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_sector_check
      CHECK (sector IN ('public', 'private'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_teams_sector ON public.teams(sector);

-- Helper function to get team sector
CREATE OR REPLACE FUNCTION get_team_sector(p_team_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT sector FROM public.teams WHERE id = p_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION 8: ADMIN SYSTEM
-- ============================================

-- Update role check constraint to include admin
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_role_check;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_role_check
  CHECK (role IN ('member', 'admin', 'leader'));

-- Create super admins table
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default super admin
INSERT INTO public.super_admins (email)
VALUES ('adambeloucif@gmail.com')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view list" ON public.super_admins;
CREATE POLICY "Super admins can view list"
  ON public.super_admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.super_admins sa
      JOIN auth.users u ON u.email = sa.email
      WHERE u.id = auth.uid()
    )
  );

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;

  RETURN EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE email = v_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is team admin (admin or leader role)
CREATE OR REPLACE FUNCTION is_team_admin(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF is_super_admin(p_user_id) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = p_user_id
    AND team_id = p_team_id
    AND role IN ('admin', 'leader')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Promote member to admin
CREATE OR REPLACE FUNCTION promote_to_admin(
  p_member_id UUID,
  p_actor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_actor_id UUID;
  v_member RECORD;
BEGIN
  v_actor_id := COALESCE(p_actor_id, auth.uid());

  SELECT * INTO v_member
  FROM public.team_members
  WHERE id = p_member_id;

  IF v_member IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Membre non trouvé'::TEXT;
    RETURN;
  END IF;

  IF NOT is_team_admin(v_actor_id, v_member.team_id) THEN
    RETURN QUERY SELECT FALSE, 'Permission refusée'::TEXT;
    RETURN;
  END IF;

  UPDATE public.team_members
  SET role = 'admin'
  WHERE id = p_member_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Demote admin to member
CREATE OR REPLACE FUNCTION demote_to_member(
  p_member_id UUID,
  p_actor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_actor_id UUID;
  v_member RECORD;
  v_actor_role TEXT;
BEGIN
  v_actor_id := COALESCE(p_actor_id, auth.uid());

  SELECT * INTO v_member
  FROM public.team_members
  WHERE id = p_member_id;

  IF v_member IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Membre non trouvé'::TEXT;
    RETURN;
  END IF;

  IF v_member.role = 'leader' THEN
    RETURN QUERY SELECT FALSE, 'Impossible de rétrograder le créateur de l''équipe'::TEXT;
    RETURN;
  END IF;

  SELECT role INTO v_actor_role
  FROM public.team_members
  WHERE user_id = v_actor_id AND team_id = v_member.team_id;

  IF NOT (v_actor_role = 'leader' OR is_super_admin(v_actor_id)) THEN
    RETURN QUERY SELECT FALSE, 'Seul le créateur peut rétrograder un admin'::TEXT;
    RETURN;
  END IF;

  UPDATE public.team_members
  SET role = 'member'
  WHERE id = p_member_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Super admin RLS policies
DROP POLICY IF EXISTS "Super admins can view all teams" ON public.teams;
CREATE POLICY "Super admins can view all teams"
  ON public.teams FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update all teams" ON public.teams;
CREATE POLICY "Super admins can update all teams"
  ON public.teams FOR UPDATE
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can view all members" ON public.team_members;
CREATE POLICY "Super admins can view all members"
  ON public.team_members FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Admins can update member roles" ON public.team_members;
CREATE POLICY "Admins can update member roles"
  ON public.team_members FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'leader')
    )
    OR is_super_admin()
  );

GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_admin TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_admin TO authenticated;
GRANT EXECUTE ON FUNCTION demote_to_member TO authenticated;

-- ============================================
-- MIGRATION 9: BIRTH DATE SUPPORT
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

CREATE INDEX IF NOT EXISTS idx_profiles_birth_date
  ON public.profiles (EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date))
  WHERE birth_date IS NOT NULL;

-- Function to get team birthdays
CREATE OR REPLACE FUNCTION get_team_birthdays(p_team_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  first_name TEXT,
  birth_date DATE,
  birth_month INTEGER,
  birth_day INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.full_name,
    p.first_name,
    p.birth_date,
    EXTRACT(MONTH FROM p.birth_date)::INTEGER as birth_month,
    EXTRACT(DAY FROM p.birth_date)::INTEGER as birth_day
  FROM public.profiles p
  JOIN public.team_members tm ON tm.user_id = p.id
  WHERE tm.team_id = p_team_id
    AND p.birth_date IS NOT NULL
  ORDER BY
    EXTRACT(MONTH FROM p.birth_date),
    EXTRACT(DAY FROM p.birth_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_team_birthdays TO authenticated;

-- Function to get upcoming birthdays
CREATE OR REPLACE FUNCTION get_upcoming_birthdays(p_team_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  first_name TEXT,
  birth_date DATE,
  next_birthday DATE,
  days_until INTEGER
) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_this_year INTEGER := EXTRACT(YEAR FROM v_today);
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.full_name,
    p.first_name,
    p.birth_date,
    CASE
      WHEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) >= v_today
      THEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER)
      ELSE make_date(v_this_year + 1, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER)
    END as next_birthday,
    CASE
      WHEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) >= v_today
      THEN (make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
      ELSE (make_date(v_this_year + 1, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
    END as days_until
  FROM public.profiles p
  JOIN public.team_members tm ON tm.user_id = p.id
  WHERE tm.team_id = p_team_id
    AND p.birth_date IS NOT NULL
    AND (
      CASE
        WHEN make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) >= v_today
        THEN (make_date(v_this_year, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
        ELSE (make_date(v_this_year + 1, EXTRACT(MONTH FROM p.birth_date)::INTEGER, EXTRACT(DAY FROM p.birth_date)::INTEGER) - v_today)
      END
    ) <= p_days
  ORDER BY days_until;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_upcoming_birthdays TO authenticated;

-- Update handle_new_user to include birth_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    birth_date
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL
        AND NEW.raw_user_meta_data->>'birth_date' != ''
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MIGRATION 10: LEAVE DAYS BY STATUS (cadre/non-cadre)
-- ============================================

-- Add default leave days columns to teams (separate for employee vs executive)
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS default_leave_days_employee INTEGER DEFAULT 25 NOT NULL;

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS default_leave_days_executive INTEGER DEFAULT 25 NOT NULL;

-- Add constraints for leave days
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_leave_days_employee_check'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_leave_days_employee_check
      CHECK (default_leave_days_employee >= 0 AND default_leave_days_employee <= 60);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_leave_days_executive_check'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_leave_days_executive_check
      CHECK (default_leave_days_executive >= 0 AND default_leave_days_executive <= 60);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Helper function to get leave days by employee type
DROP FUNCTION IF EXISTS get_default_leave_days(UUID, TEXT);
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

-- ============================================
-- MIGRATION 11: JOIN TEAM FUNCTION (FINAL)
-- ============================================

-- Drop old function signatures
DROP FUNCTION IF EXISTS join_team_by_code(UUID, TEXT, TEXT, INTEGER);

-- Create final join team function
CREATE OR REPLACE FUNCTION join_team_by_code(
  p_user_id UUID,
  p_team_code TEXT,
  p_employee_type TEXT DEFAULT 'employee',
  p_annual_leave_days INTEGER DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  team_id UUID,
  team_name TEXT,
  team_sector TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_team RECORD;
  v_existing RECORD;
  v_leave_days INTEGER;
BEGIN
  -- Validate code format
  IF NOT (p_team_code ~ '^[A-Z0-9]{8}$') THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Code équipe invalide'::TEXT;
    RETURN;
  END IF;

  -- Find team by code
  SELECT * INTO v_team FROM public.teams WHERE code = UPPER(p_team_code);

  IF v_team IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Équipe non trouvée'::TEXT;
    RETURN;
  END IF;

  -- Check if user already in a team
  SELECT * INTO v_existing FROM public.team_members WHERE user_id = p_user_id;

  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Vous êtes déjà membre d''une équipe'::TEXT;
    RETURN;
  END IF;

  -- Get leave days based on employee type
  IF p_employee_type = 'executive' THEN
    v_leave_days := v_team.default_leave_days_executive;
  ELSE
    v_leave_days := v_team.default_leave_days_employee;
  END IF;

  -- Use provided value if specified
  IF p_annual_leave_days IS NOT NULL THEN
    v_leave_days := p_annual_leave_days;
  END IF;

  -- Insert membership
  INSERT INTO public.team_members (
    user_id,
    team_id,
    role,
    employee_type,
    annual_leave_days,
    leave_balance,
    leave_balance_year
  ) VALUES (
    p_user_id,
    v_team.id,
    'member',
    p_employee_type,
    v_leave_days,
    v_leave_days,
    EXTRACT(YEAR FROM NOW())::INTEGER
  );

  RETURN QUERY SELECT TRUE, v_team.id, v_team.name, v_team.sector, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION join_team_by_code TO authenticated;

-- ============================================
-- MIGRATION 12: GET USER TEAM FUNCTION (FINAL)
-- ============================================

-- Drop old function to change return type
DROP FUNCTION IF EXISTS get_user_team(UUID);

-- Create final get_user_team function with all needed fields
CREATE OR REPLACE FUNCTION get_user_team(p_user_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  team_sector TEXT,
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
    t.sector,
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

-- ============================================
-- MIGRATION 13: TEAM STATISTICS VIEW
-- ============================================

DROP VIEW IF EXISTS public.team_leave_statistics;
CREATE VIEW public.team_leave_statistics AS
SELECT
  tm.team_id,
  COUNT(DISTINCT tm.user_id) AS total_members,
  SUM(tm.annual_leave_days) AS total_annual_days,
  SUM(tm.leave_balance) AS total_remaining_days,
  SUM(tm.annual_leave_days - tm.leave_balance) AS total_used_days,
  AVG(tm.leave_balance)::NUMERIC(5,2) AS avg_remaining_days,
  COUNT(CASE WHEN tm.employee_type = 'executive' THEN 1 END) AS executive_count,
  COUNT(CASE WHEN tm.employee_type = 'employee' THEN 1 END) AS employee_count
FROM public.team_members tm
GROUP BY tm.team_id;

COMMENT ON VIEW public.team_leave_statistics IS 'Aggregated leave statistics per team';

-- ============================================
-- DOCUMENTATION COMMENTS
-- ============================================

COMMENT ON COLUMN public.teams.sector IS 'Secteur: public ou private';
COMMENT ON COLUMN public.teams.default_leave_days_employee IS 'Default annual leave days for non-executive employees (non-cadres)';
COMMENT ON COLUMN public.teams.default_leave_days_executive IS 'Default annual leave days for executives (cadres)';
COMMENT ON COLUMN public.team_members.employee_type IS 'Employee status: employee (non-cadre) or executive (cadre)';

-- Commit transaction
COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Show all indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- Show all policies
SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
