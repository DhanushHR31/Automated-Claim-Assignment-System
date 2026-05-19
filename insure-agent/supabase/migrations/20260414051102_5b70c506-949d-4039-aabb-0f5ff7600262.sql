
-- 1. Make claim-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'claim-documents';

-- 2. Drop the overly permissive SELECT policy on storage
DROP POLICY IF EXISTS "Anyone can view claim docs" ON storage.objects;

-- 3. Add owner-scoped SELECT policy for claim-documents storage
CREATE POLICY "Agents can view own claim docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'claim-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 4. Add owner-scoped UPDATE policy for claim-documents storage
CREATE POLICY "Agents can update own claim docs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'claim-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 5. Add owner-scoped DELETE policy for claim-documents storage
CREATE POLICY "Agents can delete own claim docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'claim-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 6. Fix support_messages INSERT policy to prevent is_from_support impersonation
DROP POLICY IF EXISTS "Users can send ticket messages" ON public.support_messages;

CREATE POLICY "Users can send ticket messages"
ON public.support_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND is_from_support = false
  AND EXISTS (
    SELECT 1 FROM support_tickets
    WHERE support_tickets.id = support_messages.ticket_id
    AND support_tickets.agent_id = auth.uid()
  )
);
