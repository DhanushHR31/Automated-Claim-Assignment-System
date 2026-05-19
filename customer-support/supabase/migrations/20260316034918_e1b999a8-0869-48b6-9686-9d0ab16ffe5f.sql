
-- Create enum types
CREATE TYPE public.app_role AS ENUM ('manager', 'agent');
CREATE TYPE public.agent_availability AS ENUM ('available', 'on_assignment', 'on_leave');
CREATE TYPE public.claim_type AS ENUM ('accident', 'property', 'health', 'natural_disaster', 'industrial');
CREATE TYPE public.claim_urgency AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE public.claim_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'closed');
CREATE TYPE public.assignment_status AS ENUM ('pending', 'accepted', 'in_transit', 'inspecting', 'completed');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  home_city TEXT NOT NULL,
  home_state TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  availability agent_availability NOT NULL DEFAULT 'available',
  working_hours_start TEXT NOT NULL DEFAULT '07:00',
  working_hours_end TEXT NOT NULL DEFAULT '17:00',
  travel_allowed BOOLEAN NOT NULL DEFAULT true,
  performance_score INTEGER NOT NULL DEFAULT 80,
  active_claims INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_code TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  claim_type claim_type NOT NULL,
  urgency claim_urgency NOT NULL DEFAULT 'medium',
  status claim_status NOT NULL DEFAULT 'pending',
  description TEXT NOT NULL,
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  assigned_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_code TEXT NOT NULL UNIQUE,
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  assigned_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  distance DOUBLE PRECISION NOT NULL DEFAULT 0,
  travel_cost NUMERIC NOT NULL DEFAULT 0,
  hotel_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  status assignment_status NOT NULL DEFAULT 'pending',
  overridden BOOLEAN NOT NULL DEFAULT false,
  override_reason TEXT,
  overridden_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  performed_by TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Managers can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- Agents policies
CREATE POLICY "Authenticated can view agents" ON public.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can insert agents" ON public.agents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can update agents" ON public.agents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Agents can update own record" ON public.agents FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Claims policies
CREATE POLICY "Authenticated can view claims" ON public.claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can insert claims" ON public.claims FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can update claims" ON public.claims FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'));

-- Assignments policies
CREATE POLICY "Authenticated can view assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can insert assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can update assignments" ON public.assignments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'));

-- Audit logs policies
CREATE POLICY "Authenticated can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'agent'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate sequential codes
CREATE OR REPLACE FUNCTION public.generate_claim_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_code IS NULL OR NEW.claim_code = '' THEN
    NEW.claim_code := 'CLM-' || LPAD((SELECT COUNT(*) + 1 FROM public.claims)::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_claim_code_trigger BEFORE INSERT ON public.claims FOR EACH ROW EXECUTE FUNCTION public.generate_claim_code();

CREATE OR REPLACE FUNCTION public.generate_assignment_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignment_code IS NULL OR NEW.assignment_code = '' THEN
    NEW.assignment_code := 'ASG-' || LPAD((SELECT COUNT(*) + 1 FROM public.assignments)::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_assignment_code_trigger BEFORE INSERT ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.generate_assignment_code();
