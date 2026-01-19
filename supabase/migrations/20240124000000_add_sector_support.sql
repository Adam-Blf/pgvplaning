-- Migration: Add Sector Support (Public/Private)
-- Date: 2024-01-24
-- Description: Add sector field to teams for different leave policies
--
-- PUBLIC SECTOR: Employee type determines leave days automatically
--   - employee: 25 days
--   - executive: 30 days
--
-- PRIVATE SECTOR: Users can set custom leave days (no type restriction)

-- ============================================
-- 1. ADD SECTOR TO TEAMS
-- ============================================

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS sector TEXT
  CHECK (sector IN ('public', 'private'))
  DEFAULT 'public' NOT NULL;

-- Index for sector queries
CREATE INDEX IF NOT EXISTS idx_teams_sector ON public.teams(sector);

-- ============================================
-- 2. UPDATE SET_DEFAULT_LEAVE_DAYS FUNCTION
-- ============================================

-- This function now considers the team's sector
CREATE OR REPLACE FUNCTION set_default_leave_days()
RETURNS TRIGGER AS $$
DECLARE
  team_sector TEXT;
BEGIN
  -- Get the team's sector
  SELECT sector INTO team_sector
  FROM public.teams
  WHERE id = NEW.team_id;

  IF team_sector = 'public' THEN
    -- Public sector: days are determined by employee type
    IF NEW.employee_type = 'executive' THEN
      NEW.annual_leave_days := 30;
      NEW.leave_balance := 30;
    ELSE
      NEW.annual_leave_days := 25;
      NEW.leave_balance := 25;
    END IF;
  ELSE
    -- Private sector: use provided values or defaults
    NEW.annual_leave_days := COALESCE(NULLIF(NEW.annual_leave_days, 0), 25);
    NEW.leave_balance := COALESCE(NULLIF(NEW.leave_balance, 0), NEW.annual_leave_days);
    -- In private sector, employee_type is optional (default to 'employee')
    NEW.employee_type := COALESCE(NEW.employee_type, 'employee');
  END IF;

  -- Set the current year for balance tracking
  NEW.leave_balance_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. UPDATE JOIN_TEAM_BY_CODE FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS join_team_by_code(UUID, TEXT, TEXT, INTEGER);

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

  -- Calculate leave days based on sector
  IF v_team.sector = 'public' THEN
    -- Public sector: days determined by employee type
    v_leave_days := CASE WHEN p_employee_type = 'executive' THEN 30 ELSE 25 END;
  ELSE
    -- Private sector: use provided value or default to 25
    v_leave_days := COALESCE(p_annual_leave_days, 25);
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
-- 4. ADD HELPER FUNCTION TO GET TEAM SECTOR
-- ============================================

CREATE OR REPLACE FUNCTION get_team_sector(p_team_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT sector FROM public.teams WHERE id = p_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ADD FUNCTION TO UPDATE MEMBER LEAVE DAYS (private sector only)
-- ============================================

CREATE OR REPLACE FUNCTION update_member_leave_days(
  p_member_id UUID,
  p_new_annual_days INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_member RECORD;
  v_team RECORD;
BEGIN
  -- Get member and team info
  SELECT tm.*, t.sector INTO v_member
  FROM public.team_members tm
  JOIN public.teams t ON t.id = tm.team_id
  WHERE tm.id = p_member_id;

  IF v_member IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Membre non trouvé'::TEXT;
    RETURN;
  END IF;

  -- Only allow in private sector
  IF v_member.sector = 'public' THEN
    RETURN QUERY SELECT FALSE, 'Modification non autorisée dans le secteur public'::TEXT;
    RETURN;
  END IF;

  -- Validate days
  IF p_new_annual_days < 0 OR p_new_annual_days > 60 THEN
    RETURN QUERY SELECT FALSE, 'Nombre de jours invalide (0-60)'::TEXT;
    RETURN;
  END IF;

  -- Update
  UPDATE public.team_members
  SET
    annual_leave_days = p_new_annual_days,
    leave_balance = p_new_annual_days - (annual_leave_days - leave_balance)
  WHERE id = p_member_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_member_leave_days TO authenticated;
