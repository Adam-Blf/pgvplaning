-- Migration: Add audit logs table
-- Date: 2024-01-22
-- Description: Create audit_logs table for security tracking and compliance

-- Create audit_logs table
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

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'Audit trail for security-critical operations';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Team leaders can view team audit logs
CREATE POLICY "Leaders can view team audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.role = 'leader'
    )
  );

-- Function to create audit log entry (SECURITY DEFINER for insert)
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
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_audit_log TO authenticated;

-- Automatic audit triggers for critical tables

-- Trigger function for team operations
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

-- Create trigger for teams
DROP TRIGGER IF EXISTS audit_teams_trigger ON public.teams;
CREATE TRIGGER audit_teams_trigger
  AFTER INSERT OR DELETE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_team_changes();

-- Trigger function for team membership
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

-- Create trigger for team_members
DROP TRIGGER IF EXISTS audit_team_members_trigger ON public.team_members;
CREATE TRIGGER audit_team_members_trigger
  AFTER INSERT OR DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_membership_changes();

-- Clean up old audit logs (older than 90 days) - run as scheduled job
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
