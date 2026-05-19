
-- KYC documents table
CREATE TYPE public.document_type AS ENUM ('aadhaar', 'pan', 'income_certificate', 'ration_card', 'bank_details');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE public.kyc_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type public.document_type NOT NULL,
  document_number TEXT,
  file_url TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type)
);

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kyc docs" ON public.kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kyc docs" ON public.kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kyc docs" ON public.kyc_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own kyc docs" ON public.kyc_documents FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON public.kyc_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

CREATE POLICY "Users can upload own kyc files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own kyc files" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own kyc files" ON storage.objects FOR DELETE USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own kyc files" ON storage.objects FOR UPDATE USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add payment tracking to policies
ALTER TABLE public.insurance_policies ADD COLUMN payment_method TEXT DEFAULT 'manual';
ALTER TABLE public.insurance_policies ADD COLUMN auto_payment BOOLEAN DEFAULT false;
