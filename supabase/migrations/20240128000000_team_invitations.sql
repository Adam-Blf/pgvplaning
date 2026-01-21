-- Migration: Team Invitation Links
-- Description: System for generating shareable invitation links to join teams

-- ============================================
-- 1. INVITATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  use_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON public.team_invitations(team_id);

-- ============================================
-- 2. FUNCTIONS
-- ============================================

-- Generate secure invitation token (24 chars)
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
  token_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..24 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    SELECT EXISTS(SELECT 1 FROM public.team_invitations WHERE token = result) INTO token_exists;
    EXIT WHEN NOT token_exists;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token
CREATE OR REPLACE FUNCTION set_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invitation_token ON public.team_invitations;
CREATE TRIGGER trigger_set_invitation_token
  BEFORE INSERT ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION set_invitation_token();

-- Update timestamp trigger
DROP TRIGGER IF EXISTS trigger_invitations_updated_at ON public.team_invitations;
CREATE TRIGGER trigger_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Validate and get invitation details
CREATE OR REPLACE FUNCTION validate_invitation(p_token TEXT)
RETURNS TABLE (
  invitation_id UUID,
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_invitation RECORD;
  v_team RECORD;
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation
  FROM public.team_invitations
  WHERE token = p_token;

  -- Check if invitation exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      NULL::UUID, NULL::UUID, NULL::TEXT, NULL::TEXT,
      false, 'Lien d''invitation invalide'::TEXT;
    RETURN;
  END IF;

  -- Check if active
  IF NOT v_invitation.is_active THEN
    RETURN QUERY SELECT
      v_invitation.id, v_invitation.team_id, NULL::TEXT, NULL::TEXT,
      false, 'Cette invitation a été désactivée'::TEXT;
    RETURN;
  END IF;

  -- Check expiration
  IF v_invitation.expires_at < NOW() THEN
    RETURN QUERY SELECT
      v_invitation.id, v_invitation.team_id, NULL::TEXT, NULL::TEXT,
      false, 'Cette invitation a expiré'::TEXT;
    RETURN;
  END IF;

  -- Check max uses
  IF v_invitation.max_uses IS NOT NULL AND v_invitation.use_count >= v_invitation.max_uses THEN
    RETURN QUERY SELECT
      v_invitation.id, v_invitation.team_id, NULL::TEXT, NULL::TEXT,
      false, 'Cette invitation a atteint son nombre maximum d''utilisations'::TEXT;
    RETURN;
  END IF;

  -- Get team details
  SELECT * INTO v_team
  FROM public.teams
  WHERE id = v_invitation.team_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      v_invitation.id, v_invitation.team_id, NULL::TEXT, NULL::TEXT,
      false, 'L''équipe n''existe plus'::TEXT;
    RETURN;
  END IF;

  -- Valid invitation
  RETURN QUERY SELECT
    v_invitation.id, v_team.id, v_team.name, v_team.code,
    true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use invitation (increment counter)
CREATE OR REPLACE FUNCTION use_invitation(p_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.team_invitations
  SET use_count = use_count + 1,
      updated_at = NOW()
  WHERE token = p_token
    AND is_active = true
    AND expires_at > NOW()
    AND (max_uses IS NULL OR use_count < max_uses);

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Leaders can view their team's invitations
CREATE POLICY "Leaders can view team invitations"
  ON public.team_invitations FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- Anyone can view invitation by token (for validation)
CREATE POLICY "Anyone can validate invitation token"
  ON public.team_invitations FOR SELECT
  USING (true);

-- Leaders can create invitations for their team
CREATE POLICY "Leaders can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- Leaders can update/deactivate their team's invitations
CREATE POLICY "Leaders can update invitations"
  ON public.team_invitations FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- Leaders can delete their team's invitations
CREATE POLICY "Leaders can delete invitations"
  ON public.team_invitations FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );
