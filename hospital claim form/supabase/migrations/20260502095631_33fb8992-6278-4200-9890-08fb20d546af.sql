
-- Re-create functions with explicit search_path (already set, but ensure) and revoke broad execute
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE ALL ON FUNCTION public.current_hospital_id() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_belongs_to_me(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_hospital_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Seed: insurance company
INSERT INTO public.insurance_companies (id, company_name, contact_email, contact_phone, address)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Apex Health Insurance', 'claims@apexhealth.in', '+91-1800-123-456', 'Mumbai, India'),
  ('22222222-2222-2222-2222-222222222222', 'SecureLife Insurance', 'support@securelife.in', '+91-1800-456-789', 'Bengaluru, India');

-- Seed: policies (use fixed policy numbers so users can try them)
INSERT INTO public.policies (policy_number, customer_name, aadhaar_number, pan_number, contact_number, email, company_id, policy_type, coverage_amount, start_date, end_date, status, corporate_company_name)
VALUES
  ('POL-1001', 'Rahul Sharma',  '1234-5678-9012', 'ABCDE1234F', '+91-9876543210', 'rahul@example.com',  '11111111-1111-1111-1111-111111111111', 'individual', 500000,  '2025-01-01', '2027-01-01', 'active',  NULL),
  ('POL-1002', 'Priya Verma',   '2234-5678-9012', 'BBCDE1234F', '+91-9876543211', 'priya@example.com',  '11111111-1111-1111-1111-111111111111', 'individual', 300000,  '2025-06-15', '2026-06-15', 'active',  NULL),
  ('POL-1003', 'Amit Patel',    '3234-5678-9012', 'CBCDE1234F', '+91-9876543212', 'amit@example.com',   '22222222-2222-2222-2222-222222222222', 'corporate',  1000000, '2025-04-01', '2027-04-01', 'active',  'Tata Consultancy Services'),
  ('POL-1004', 'Sneha Iyer',    '4234-5678-9012', 'DBCDE1234F', '+91-9876543213', 'sneha@example.com',  '22222222-2222-2222-2222-222222222222', 'individual', 200000,  '2022-01-01', '2024-01-01', 'expired', NULL),
  ('POL-1005', 'Vikram Singh',  '5234-5678-9012', 'EBCDE1234F', '+91-9876543214', 'vikram@example.com', '11111111-1111-1111-1111-111111111111', 'corporate',  750000,  '2025-03-01', '2026-03-01', 'active',  'Infosys Limited');
