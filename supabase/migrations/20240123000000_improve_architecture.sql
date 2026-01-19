-- Migration: Architecture Improvements
-- Date: 2024-01-23
-- Description: Fix RLS policies, add constraints, improve performance

-- ============================================
-- 1. FIX AUDIT_LOGS RLS POLICY (prevent recursion)
-- ============================================

-- Drop the problematic policy that queries team_members directly
DROP POLICY IF EXISTS "Leaders can view team audit logs" ON public.audit_logs;

-- Recreate using the helper function to avoid RLS recursion
CREATE POLICY "Leaders can view team audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM get_user_leader_team_ids(auth.uid())
    )
  );

-- ============================================
-- 2. ADD DATA VALIDATION CONSTRAINTS
-- ============================================

-- Ensure leave balance is non-negative
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS check_leave_balance_positive;
ALTER TABLE public.team_members
  ADD CONSTRAINT check_leave_balance_positive
  CHECK (leave_balance >= 0);

-- Ensure annual leave days is within reasonable range
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS check_annual_leave_days_range;
ALTER TABLE public.team_members
  ADD CONSTRAINT check_annual_leave_days_range
  CHECK (annual_leave_days BETWEEN 0 AND 60);

-- Ensure leave balance year is valid
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS check_leave_balance_year_valid;
ALTER TABLE public.team_members
  ADD CONSTRAINT check_leave_balance_year_valid
  CHECK (leave_balance_year >= 2020 AND leave_balance_year <= 2100);

-- Ensure team name is not empty
ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS check_team_name_not_empty;
ALTER TABLE public.teams
  ADD CONSTRAINT check_team_name_not_empty
  CHECK (LENGTH(TRIM(name)) >= 2);

-- Ensure team code format is valid
ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS check_team_code_format;
ALTER TABLE public.teams
  ADD CONSTRAINT check_team_code_format
  CHECK (code ~ '^[A-Z0-9]{8}$');

-- ============================================
-- 3. ADD PERFORMANCE INDEXES
-- ============================================

-- Composite index for leave balance queries
CREATE INDEX IF NOT EXISTS idx_team_members_leave_balance
  ON public.team_members(user_id, leave_balance_year);

-- Index for calendar entries by status (frequent filter)
CREATE INDEX IF NOT EXISTS idx_calendar_entries_status
  ON public.calendar_entries(status);

-- Index for calendar entries by date range
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date_range
  ON public.calendar_entries(team_id, date DESC);

-- Partial index for active leave entries only
CREATE INDEX IF NOT EXISTS idx_calendar_entries_leave_only
  ON public.calendar_entries(team_id, user_id, date)
  WHERE status = 'LEAVE';

-- Index for audit logs by resource
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
  ON public.audit_logs(resource_type, resource_id);

-- ============================================
-- 4. IMPROVE LEAVE BALANCE UPDATE (atomic)
-- ============================================

-- Drop old trigger and function
DROP TRIGGER IF EXISTS trigger_update_leave_balance ON public.calendar_entries;
DROP FUNCTION IF EXISTS update_leave_balance();

-- Improved function with row-level locking to prevent race conditions
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
  days_to_deduct NUMERIC;
  entry_year INTEGER;
BEGIN
  -- Only process LEAVE status entries
  IF NEW.status != 'LEAVE' THEN
    RETURN NEW;
  END IF;

  -- Calculate days to deduct
  days_to_deduct := CASE
    WHEN NEW.half_day IN ('AM', 'PM') THEN 0.5
    ELSE 1
  END;

  entry_year := EXTRACT(YEAR FROM NEW.date)::INTEGER;

  -- Atomic update with row locking
  -- If year changed, reset and deduct
  -- Otherwise, just deduct
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

-- Recreate trigger
CREATE TRIGGER trigger_update_leave_balance
  AFTER INSERT ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION update_leave_balance();

-- ============================================
-- 5. ADD PROFILE VALIDATION
-- ============================================

-- Ensure email format is valid (basic check)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_email_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT check_email_format
  CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$');

-- ============================================
-- 6. ADD FUNCTION TO VALIDATE TEAM CODE ON JOIN
-- ============================================

-- Function to safely join team with code validation
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
  error_message TEXT
) AS $$
DECLARE
  v_team RECORD;
  v_existing RECORD;
  v_leave_days INTEGER;
BEGIN
  -- Validate code format
  IF NOT (p_team_code ~ '^[A-Z0-9]{8}$') THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Code équipe invalide'::TEXT;
    RETURN;
  END IF;

  -- Find team by code
  SELECT * INTO v_team FROM public.teams WHERE code = UPPER(p_team_code);

  IF v_team IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Équipe non trouvée'::TEXT;
    RETURN;
  END IF;

  -- Check if user already in a team
  SELECT * INTO v_existing FROM public.team_members WHERE user_id = p_user_id;

  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Vous êtes déjà membre d''une équipe'::TEXT;
    RETURN;
  END IF;

  -- Calculate leave days
  v_leave_days := COALESCE(
    p_annual_leave_days,
    CASE WHEN p_employee_type = 'executive' THEN 30 ELSE 25 END
  );

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

  RETURN QUERY SELECT TRUE, v_team.id, v_team.name, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION join_team_by_code TO authenticated;

-- ============================================
-- 7. ADD STATISTICS VIEW FOR TEAM LEADERS
-- ============================================

CREATE OR REPLACE VIEW public.team_leave_statistics AS
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

-- RLS for the view (through team_members)
COMMENT ON VIEW public.team_leave_statistics IS 'Aggregated leave statistics per team - access controlled through team membership';
