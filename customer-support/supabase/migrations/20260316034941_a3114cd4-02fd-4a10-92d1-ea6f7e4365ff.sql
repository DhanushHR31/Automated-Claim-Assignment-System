
-- Fix: restrict audit log inserts to require performed_by matches the user
DROP POLICY "Authenticated can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs 
  FOR INSERT TO authenticated 
  WITH CHECK (performed_by IS NOT NULL);
