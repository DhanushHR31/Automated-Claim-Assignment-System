-- 1. Restrict all sensitive policies from `public` role to `authenticated` role
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Claims
DROP POLICY IF EXISTS "Agents can view assigned claims" ON public.claims;
DROP POLICY IF EXISTS "Agents can update assigned claims" ON public.claims;

CREATE POLICY "Agents can view assigned claims" ON public.claims
  FOR SELECT TO authenticated USING (auth.uid() = assigned_agent_id);
CREATE POLICY "Agents can update assigned claims" ON public.claims
  FOR UPDATE TO authenticated USING (auth.uid() = assigned_agent_id);

-- Claim documents
DROP POLICY IF EXISTS "Agents can view own docs" ON public.claim_documents;
DROP POLICY IF EXISTS "Agents can insert own docs" ON public.claim_documents;

CREATE POLICY "Agents can view own docs" ON public.claim_documents
  FOR SELECT TO authenticated USING (auth.uid() = agent_id);
CREATE POLICY "Agents can insert own docs" ON public.claim_documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);

-- Messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages read" ON public.messages;

CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT TO authenticated USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can mark messages read" ON public.messages
  FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Support tickets
DROP POLICY IF EXISTS "Agents can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Agents can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Agents can update own tickets" ON public.support_tickets;

CREATE POLICY "Agents can view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (auth.uid() = agent_id);
CREATE POLICY "Agents can create tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Agents can update own tickets" ON public.support_tickets
  FOR UPDATE TO authenticated USING (auth.uid() = agent_id);

-- Support messages
DROP POLICY IF EXISTS "Users can view ticket messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can send ticket messages" ON public.support_messages;

CREATE POLICY "Users can view ticket messages" ON public.support_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
        AND support_tickets.agent_id = auth.uid()
    )
  );
CREATE POLICY "Users can send ticket messages" ON public.support_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id
    AND is_from_support = false
    AND EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
        AND support_tickets.agent_id = auth.uid()
    )
  );

-- 2. Realtime authorization: scope channel subscriptions
-- Topic convention: "user:<uid>" for personal channels, "claim:<claim_id>" for claim-scoped channels.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read own user channel" ON realtime.messages;
CREATE POLICY "Authenticated users can read own user channel"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.topic() = ('user:' || auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM public.claims
      WHERE ('claim:' || claims.id::text) = realtime.topic()
        AND claims.assigned_agent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can broadcast on own user channel" ON realtime.messages;
CREATE POLICY "Authenticated users can broadcast on own user channel"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() = ('user:' || auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM public.claims
      WHERE ('claim:' || claims.id::text) = realtime.topic()
        AND claims.assigned_agent_id = auth.uid()
    )
  );