
CREATE POLICY "Agents can insert own record"
  ON public.agents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
