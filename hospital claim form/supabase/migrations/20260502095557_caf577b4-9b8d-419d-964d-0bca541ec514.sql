
-- Enums
CREATE TYPE public.policy_type AS ENUM ('individual', 'corporate');
CREATE TYPE public.policy_status AS ENUM ('active', 'expired');
CREATE TYPE public.claim_status AS ENUM ('initiated','pending_approval','approved','rejected','under_verification','paid');
CREATE TYPE public.approval_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.payment_status AS ENUM ('pending','completed');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','closed');
CREATE TYPE public.document_type AS ENUM ('aadhaar','pan','insurance_doc','admission_doc','diagnosis_report','discharge_summary','final_bill','pharmacy_bill','company_id');

-- Hospitals (1 per auth user)
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  email TEXT,
  contact_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  license_number TEXT,
  specialization TEXT,
  bed_capacity INTEGER,
  registration_certificate_url TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insurance Companies
CREATE TABLE public.insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Policies
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  aadhaar_number TEXT,
  pan_number TEXT,
  contact_number TEXT,
  email TEXT,
  company_id UUID NOT NULL REFERENCES public.insurance_companies(id) ON DELETE RESTRICT,
  policy_type public.policy_type NOT NULL DEFAULT 'individual',
  coverage_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status public.policy_status NOT NULL DEFAULT 'active',
  corporate_company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claims
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT NOT NULL UNIQUE DEFAULT ('CLM-' || to_char(now(),'YYYYMMDD') || '-' || lpad((floor(random()*100000))::text,5,'0')),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE RESTRICT,
  claim_status public.claim_status NOT NULL DEFAULT 'initiated',
  diagnosis TEXT,
  treatment_details TEXT,
  doctor_name TEXT,
  admission_date DATE,
  discharge_date DATE,
  estimated_amount NUMERIC(12,2) DEFAULT 0,
  approved_amount NUMERIC(12,2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patient details for claim
CREATE TABLE public.claim_patient_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL UNIQUE REFERENCES public.claims(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  aadhaar_number TEXT,
  pan_number TEXT,
  contact_number TEXT,
  email TEXT,
  relation_to_policy_holder TEXT,
  is_corporate BOOLEAN NOT NULL DEFAULT false,
  corporate_company_name TEXT,
  employee_id TEXT,
  company_id_card_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE public.claim_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  document_type public.document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Approvals
CREATE TABLE public.claim_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.insurance_companies(id),
  approval_status public.approval_status NOT NULL DEFAULT 'pending',
  remarks TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Billing
CREATE TABLE public.claim_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  total_bill NUMERIC(12,2) NOT NULL DEFAULT 0,
  pharmacy_bill NUMERIC(12,2) DEFAULT 0,
  final_bill_url TEXT,
  discharge_summary_url TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.claim_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_date DATE,
  transaction_id TEXT,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  issue TEXT NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'open',
  screenshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL DEFAULT 'hospital',
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_hospitals_upd BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_claims_upd BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tickets_upd BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create hospital profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_hospital_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.hospitals (user_id, hospital_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'hospital_name', 'My Hospital'),
    NEW.email
  );
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_hospital_user();

-- Helper: get hospital_id for current user
CREATE OR REPLACE FUNCTION public.current_hospital_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.hospitals WHERE user_id = auth.uid() LIMIT 1
$$;

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policies: hospitals
CREATE POLICY "hospitals self select" ON public.hospitals FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "hospitals self update" ON public.hospitals FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Insurance companies + policies: readable by any auth user
CREATE POLICY "ins read" ON public.insurance_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "policies read" ON public.policies FOR SELECT TO authenticated USING (true);

-- Claims: scoped to hospital
CREATE POLICY "claims own select" ON public.claims FOR SELECT TO authenticated USING (hospital_id = public.current_hospital_id());
CREATE POLICY "claims own insert" ON public.claims FOR INSERT TO authenticated WITH CHECK (hospital_id = public.current_hospital_id());
CREATE POLICY "claims own update" ON public.claims FOR UPDATE TO authenticated USING (hospital_id = public.current_hospital_id());

-- Helper for child tables
CREATE OR REPLACE FUNCTION public.claim_belongs_to_me(_claim UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.claims WHERE id = _claim AND hospital_id = public.current_hospital_id())
$$;

CREATE POLICY "patient sel" ON public.claim_patient_details FOR SELECT TO authenticated USING (public.claim_belongs_to_me(claim_id));
CREATE POLICY "patient ins" ON public.claim_patient_details FOR INSERT TO authenticated WITH CHECK (public.claim_belongs_to_me(claim_id));
CREATE POLICY "patient upd" ON public.claim_patient_details FOR UPDATE TO authenticated USING (public.claim_belongs_to_me(claim_id));

CREATE POLICY "doc sel" ON public.claim_documents FOR SELECT TO authenticated USING (public.claim_belongs_to_me(claim_id));
CREATE POLICY "doc ins" ON public.claim_documents FOR INSERT TO authenticated WITH CHECK (public.claim_belongs_to_me(claim_id));
CREATE POLICY "doc del" ON public.claim_documents FOR DELETE TO authenticated USING (public.claim_belongs_to_me(claim_id));

CREATE POLICY "appr sel" ON public.claim_approvals FOR SELECT TO authenticated USING (public.claim_belongs_to_me(claim_id));
CREATE POLICY "appr ins" ON public.claim_approvals FOR INSERT TO authenticated WITH CHECK (public.claim_belongs_to_me(claim_id));

CREATE POLICY "bill sel" ON public.claim_billing FOR SELECT TO authenticated USING (public.claim_belongs_to_me(claim_id));
CREATE POLICY "bill ins" ON public.claim_billing FOR INSERT TO authenticated WITH CHECK (public.claim_belongs_to_me(claim_id));

CREATE POLICY "pay sel" ON public.claim_payments FOR SELECT TO authenticated USING (public.claim_belongs_to_me(claim_id));

CREATE POLICY "tk sel" ON public.support_tickets FOR SELECT TO authenticated USING (hospital_id = public.current_hospital_id());
CREATE POLICY "tk ins" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (hospital_id = public.current_hospital_id());
CREATE POLICY "tk upd" ON public.support_tickets FOR UPDATE TO authenticated USING (hospital_id = public.current_hospital_id());

CREATE POLICY "msg sel" ON public.support_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.hospital_id = public.current_hospital_id())
);
CREATE POLICY "msg ins" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.hospital_id = public.current_hospital_id())
);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth read own claim files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'claim-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth upload own claim files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'claim-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth delete own claim files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'claim-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
