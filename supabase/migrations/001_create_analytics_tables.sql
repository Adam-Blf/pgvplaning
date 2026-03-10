-- Supabase migrations for Absencia
-- Run this SQL in the Supabase SQL Editor to create the analytics tables.
-- Row Level Security (RLS) is enabled on all tables.

-- ─── Table: leave_history ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_user_id TEXT NOT NULL,
  team_id TEXT,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('conges', 'maladie', 'formation', 'teletravail', 'bureau', 'autre')),
  is_half_day BOOLEAN DEFAULT false,
  half_day_type TEXT CHECK (half_day_type IN ('am', 'pm') OR half_day_type IS NULL),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (firebase_user_id, date, status)
);

CREATE INDEX IF NOT EXISTS idx_leave_history_user ON public.leave_history (firebase_user_id);
CREATE INDEX IF NOT EXISTS idx_leave_history_team ON public.leave_history (team_id);
CREATE INDEX IF NOT EXISTS idx_leave_history_date ON public.leave_history (date);

-- Enable RLS (Row Level Security) — no access by default
ALTER TABLE public.leave_history ENABLE ROW LEVEL SECURITY;

-- Only the service role key (server-side) can write leave_history
-- No direct client-side write allowed
CREATE POLICY "Service role full access to leave_history"
  ON public.leave_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon/authenticated users can read their own entries only
CREATE POLICY "Users read own leave_history"
  ON public.leave_history
  FOR SELECT
  TO anon, authenticated
  USING (firebase_user_id = current_setting('app.firebase_uid', true));


-- ─── Table: audit_log ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  previous_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log (firebase_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log (created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can write audit_log (immutable from client)
CREATE POLICY "Service role full access to audit_log"
  ON public.audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No client-side read of other users' audit entries
CREATE POLICY "Users read own audit_log"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (firebase_user_id = current_setting('app.firebase_uid', true));


-- ─── Table: team_monthly_stats ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_monthly_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL,
  month DATE NOT NULL,
  total_leave_days DECIMAL DEFAULT 0,
  total_remote_days DECIMAL DEFAULT 0,
  total_sick_days DECIMAL DEFAULT 0,
  member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (team_id, month)
);

CREATE INDEX IF NOT EXISTS idx_team_stats_team ON public.team_monthly_stats (team_id);
CREATE INDEX IF NOT EXISTS idx_team_stats_month ON public.team_monthly_stats (month);

ALTER TABLE public.team_monthly_stats ENABLE ROW LEVEL SECURITY;

-- Only service role writes stats
CREATE POLICY "Service role full access to team_monthly_stats"
  ON public.team_monthly_stats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users (team leaders) can read team stats
CREATE POLICY "Authenticated users read team_monthly_stats"
  ON public.team_monthly_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);
