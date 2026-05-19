
-- Create managers table
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  department TEXT DEFAULT 'Claims',
  max_agents INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view managers" ON public.managers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can insert managers" ON public.managers
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can update managers" ON public.managers
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Add manager_id to agents
ALTER TABLE public.agents ADD COLUMN manager_id UUID REFERENCES public.managers(id);

-- Trigger for updated_at
CREATE TRIGGER update_managers_updated_at
  BEFORE UPDATE ON public.managers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
