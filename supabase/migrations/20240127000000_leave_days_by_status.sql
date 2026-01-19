-- Migration: Add separate leave days for employee vs executive (cadre)
-- Description: Allow teams to configure different leave days for cadres and non-cadres

-- ============================================
-- 1. UPDATE TEAMS TABLE
-- ============================================

-- Rename default_leave_days to default_leave_days_employee (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'default_leave_days'
  ) THEN
    ALTER TABLE public.teams
      RENAME COLUMN default_leave_days TO default_leave_days_employee;
  END IF;
END $$;

-- Add default_leave_days_employee if it doesn't exist (fresh installs)
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS default_leave_days_employee INTEGER DEFAULT 25 NOT NULL;

-- Add default_leave_days_executive (cadre)
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS default_leave_days_executive INTEGER DEFAULT 25 NOT NULL;

-- Add constraints
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
END $$;

-- ============================================
-- 2. UPDATE TEAM_MEMBERS TABLE
-- ============================================

-- Update employee_type check constraint to include 'executive' (cadre)
-- First drop existing constraint if it exists
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_employee_type_check;

-- Add proper constraint for employee_type
DO $$
BEGIN
  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'employee_type'
  ) THEN
    ALTER TABLE public.team_members
      ADD COLUMN employee_type TEXT DEFAULT 'employee' NOT NULL;
  END IF;
END $$;

-- Add the check constraint
ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_employee_type_check
  CHECK (employee_type IN ('employee', 'executive'));

-- ============================================
-- 3. HELPER FUNCTION TO GET LEAVE DAYS BY TYPE
-- ============================================

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
-- 4. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN public.teams.default_leave_days_employee IS 'Default annual leave days for non-executive employees (non-cadres)';
COMMENT ON COLUMN public.teams.default_leave_days_executive IS 'Default annual leave days for executives (cadres)';
COMMENT ON COLUMN public.team_members.employee_type IS 'Employee status: employee (non-cadre) or executive (cadre)';
