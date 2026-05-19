
-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-documents', 'claim-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload claim documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'claim-documents');

CREATE POLICY "Authenticated users can view claim documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'claim-documents');
