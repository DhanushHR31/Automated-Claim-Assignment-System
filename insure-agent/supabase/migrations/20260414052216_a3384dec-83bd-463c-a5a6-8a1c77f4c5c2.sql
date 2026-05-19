
-- Allow agents to see unassigned claims so they can accept them
CREATE POLICY "Agents can view unassigned claims"
ON public.claims
FOR SELECT
TO authenticated
USING (assigned_agent_id IS NULL);

-- Allow agents to accept unassigned claims by updating them
CREATE POLICY "Agents can accept unassigned claims"
ON public.claims
FOR UPDATE
TO authenticated
USING (assigned_agent_id IS NULL)
WITH CHECK (assigned_agent_id = auth.uid());
