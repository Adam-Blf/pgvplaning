-- Migration: Add Admin System
-- Date: 2024-01-25
-- Description: Add admin roles and super admin support
--
-- ROLES:
--   - member: Regular team member
--   - admin: Can manage team members and settings
--   - leader: Team creator, full control (deprecated, use admin)
--
-- SUPER ADMIN: adambeloucif@gmail.com has global admin access

-- ============================================
-- 1. UPDATE ROLE CHECK CONSTRAINT
-- ============================================

-- Drop old constraint and add new one with admin role
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_role_check;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_role_check
  CHECK (role IN ('member', 'admin', 'leader'));

-- ============================================
-- 2. CREATE SUPER ADMIN TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default super admin
INSERT INTO public.super_admins (email)
VALUES ('adambeloucif@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can see the super admin list
CREATE POLICY "Super admins can view list"
  ON public.super_admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.super_admins sa
      JOIN auth.users u ON u.email = sa.email
      WHERE u.id = auth.uid()
    )
  );

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

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
  -- Super admin has access to all teams
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

-- ============================================
-- 4. ADD TEAM LEAVE DAYS CONFIG
-- ============================================

-- Add default leave days at team level (creator sets this)
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS default_leave_days INTEGER DEFAULT 25 NOT NULL;

-- ============================================
-- 5. UPDATE FUNCTIONS FOR TEAM ADMIN MANAGEMENT
-- ============================================

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

  -- Get member info
  SELECT * INTO v_member
  FROM public.team_members
  WHERE id = p_member_id;

  IF v_member IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Membre non trouvé'::TEXT;
    RETURN;
  END IF;

  -- Check if actor has permission
  IF NOT is_team_admin(v_actor_id, v_member.team_id) THEN
    RETURN QUERY SELECT FALSE, 'Permission refusée'::TEXT;
    RETURN;
  END IF;

  -- Update role
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

  -- Get member info
  SELECT * INTO v_member
  FROM public.team_members
  WHERE id = p_member_id;

  IF v_member IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Membre non trouvé'::TEXT;
    RETURN;
  END IF;

  -- Cannot demote team leader
  IF v_member.role = 'leader' THEN
    RETURN QUERY SELECT FALSE, 'Impossible de rétrograder le créateur de l''équipe'::TEXT;
    RETURN;
  END IF;

  -- Check if actor has permission (only leader or super admin can demote)
  SELECT role INTO v_actor_role
  FROM public.team_members
  WHERE user_id = v_actor_id AND team_id = v_member.team_id;

  IF NOT (v_actor_role = 'leader' OR is_super_admin(v_actor_id)) THEN
    RETURN QUERY SELECT FALSE, 'Seul le créateur peut rétrograder un admin'::TEXT;
    RETURN;
  END IF;

  -- Update role
  UPDATE public.team_members
  SET role = 'member'
  WHERE id = p_member_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. UPDATE RLS POLICIES
-- ============================================

-- Allow super admins to view all teams
DROP POLICY IF EXISTS "Super admins can view all teams" ON public.teams;
CREATE POLICY "Super admins can view all teams"
  ON public.teams FOR SELECT
  USING (is_super_admin());

-- Allow super admins to update all teams
DROP POLICY IF EXISTS "Super admins can update all teams" ON public.teams;
CREATE POLICY "Super admins can update all teams"
  ON public.teams FOR UPDATE
  USING (is_super_admin());

-- Allow super admins to view all team members
DROP POLICY IF EXISTS "Super admins can view all members" ON public.team_members;
CREATE POLICY "Super admins can view all members"
  ON public.team_members FOR SELECT
  USING (is_super_admin());

-- Allow admins to update member roles
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_admin TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_admin TO authenticated;
GRANT EXECUTE ON FUNCTION demote_to_member TO authenticated;

-- ============================================
-- 7. UPDATE JOIN FUNCTION TO USE TEAM LEAVE DAYS
-- ============================================

-- Recreate join function to use team's default leave days
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

  -- Use team's default leave days (set by creator)
  v_leave_days := v_team.default_leave_days;

  -- Insert membership as regular member
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
    'employee',  -- All members are just "members"
    v_leave_days,
    v_leave_days,
    EXTRACT(YEAR FROM NOW())::INTEGER
  );

  RETURN QUERY SELECT TRUE, v_team.id, v_team.name, v_team.sector, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION join_team_by_code TO authenticated;
