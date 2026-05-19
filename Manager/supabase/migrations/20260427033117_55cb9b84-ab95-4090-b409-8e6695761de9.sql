
-- Enum of audit-able actions
CREATE TYPE public.manager_audit_action AS ENUM (
  'password_changed',
  'avatar_updated',
  'avatar_removed'
);

CREATE TABLE public.manager_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action public.manager_audit_action NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_manager_audit_log_user_id_created_at
  ON public.manager_audit_log (user_id, created_at DESC);

ALTER TABLE public.manager_audit_log ENABLE ROW LEVEL SECURITY;

-- Owners can read their own log
CREATE POLICY "Managers can view their own audit log"
  ON public.manager_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can insert their own entries (append-only)
CREATE POLICY "Managers can insert their own audit entries"
  ON public.manager_audit_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE / DELETE policies → log is immutable from the client
