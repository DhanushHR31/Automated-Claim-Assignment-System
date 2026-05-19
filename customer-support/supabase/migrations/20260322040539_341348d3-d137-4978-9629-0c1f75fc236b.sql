-- Allow agents to update assignments assigned to them
CREATE POLICY "Agents can update own assignments"
ON public.assignments
FOR UPDATE
TO authenticated
USING (
  agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
);