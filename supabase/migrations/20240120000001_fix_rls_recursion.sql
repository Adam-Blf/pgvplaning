-- Migration: Fix RLS Infinite Recursion
-- Description: Fix infinite recursion in team_members policies by using SECURITY DEFINER functions

-- ============================================
-- 1. CREATE HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Function to get user's team IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_team_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT team_id FROM public.team_members
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is leader of a team (bypasses RLS)
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

-- Function to get user's leader team IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_leader_team_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT team_id FROM public.team_members
  WHERE user_id = p_user_id AND role = 'leader';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. DROP OLD POLICIES
-- ============================================

-- Drop team_members policies
DROP POLICY IF EXISTS "View team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON public.team_members;
DROP POLICY IF EXISTS "Leaders can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Leaders can update member roles" ON public.team_members;

-- Drop teams policies that reference team_members
DROP POLICY IF EXISTS "Team members can view their team" ON public.teams;
DROP POLICY IF EXISTS "Leaders can update their team" ON public.teams;
DROP POLICY IF EXISTS "Leaders can delete their team" ON public.teams;

-- Drop calendar_entries policies
DROP POLICY IF EXISTS "View team calendar" ON public.calendar_entries;
DROP POLICY IF EXISTS "Leaders manage team calendar" ON public.calendar_entries;

-- Drop profiles policy
DROP POLICY IF EXISTS "Team members can view teammate profiles" ON public.profiles;

-- ============================================
-- 3. RECREATE POLICIES WITH HELPER FUNCTIONS
-- ============================================

-- ----- TEAM MEMBERS POLICIES -----

-- Members can view other members of their team (using helper function)
CREATE POLICY "View team members"
  ON public.team_members FOR SELECT
  USING (team_id IN (SELECT get_user_team_ids(auth.uid())));

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
  USING (team_id IN (SELECT get_user_leader_team_ids(auth.uid())));

-- Leaders can update member roles
CREATE POLICY "Leaders can update member roles"
  ON public.team_members FOR UPDATE
  USING (team_id IN (SELECT get_user_leader_team_ids(auth.uid())));

-- ----- TEAMS POLICIES -----

-- Team members can view their team details
CREATE POLICY "Team members can view their team"
  ON public.teams FOR SELECT
  USING (id IN (SELECT get_user_team_ids(auth.uid())));

-- Leaders can update their team
CREATE POLICY "Leaders can update their team"
  ON public.teams FOR UPDATE
  USING (id IN (SELECT get_user_leader_team_ids(auth.uid())));

-- Leaders can delete their team
CREATE POLICY "Leaders can delete their team"
  ON public.teams FOR DELETE
  USING (id IN (SELECT get_user_leader_team_ids(auth.uid())));

-- ----- CALENDAR ENTRIES POLICIES -----

-- Team members can view all calendar entries for their team
CREATE POLICY "View team calendar"
  ON public.calendar_entries FOR SELECT
  USING (team_id IN (SELECT get_user_team_ids(auth.uid())));

-- Leaders can manage all team calendar entries
CREATE POLICY "Leaders manage team calendar"
  ON public.calendar_entries FOR ALL
  USING (team_id IN (SELECT get_user_leader_team_ids(auth.uid())));

-- ----- PROFILES POLICY -----

-- Team members can view profiles of their teammates (using subquery with helper)
CREATE POLICY "Team members can view teammate profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT tm.user_id
      FROM public.team_members tm
      WHERE tm.team_id IN (SELECT get_user_team_ids(auth.uid()))
    )
  );
