create table if not exists public.agent_payment_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  bank_name text not null default '',
  account_number text not null default '',
  ifsc_code text not null default '',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.agent_payment_details enable row level security;

create policy "Users can view own payment details"
on public.agent_payment_details
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own payment details"
on public.agent_payment_details
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own payment details"
on public.agent_payment_details
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger update_agent_payment_details_updated_at
before update on public.agent_payment_details
for each row
execute function public.update_updated_at_column();

insert into public.agent_payment_details (user_id, bank_name, account_number, ifsc_code)
select p.user_id, coalesce(p.bank_name, ''), coalesce(p.account_number, ''), coalesce(p.ifsc_code, '')
from public.profiles p
on conflict (user_id) do update
set bank_name = excluded.bank_name,
    account_number = excluded.account_number,
    ifsc_code = excluded.ifsc_code;

alter table public.profiles
drop column if exists bank_name,
drop column if exists account_number,
drop column if exists ifsc_code;

drop policy if exists "Agents can view unassigned claims" on public.claims;

create or replace function public.get_claim_queue()
returns table (
  id uuid,
  claim_number text,
  claim_type text,
  priority text,
  status text,
  customer_name text,
  customer_phone text,
  policy_number text,
  incident_description text,
  claim_amount numeric,
  location_address text,
  location_lat double precision,
  location_lng double precision,
  district text,
  assigned_agent_id uuid,
  assigned_at timestamp with time zone,
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.claim_number,
    c.claim_type,
    c.priority,
    c.status,
    'Accept claim to view customer'::text as customer_name,
    ''::text as customer_phone,
    ''::text as policy_number,
    'Accept this claim to unlock customer details and incident notes.'::text as incident_description,
    c.claim_amount,
    'Accept claim to view exact address'::text as location_address,
    round(c.location_lat::numeric, 3)::double precision as location_lat,
    round(c.location_lng::numeric, 3)::double precision as location_lng,
    c.district,
    c.assigned_agent_id,
    c.assigned_at,
    c.accepted_at,
    c.completed_at,
    c.created_at,
    c.updated_at
  from public.claims c
  where c.assigned_agent_id is null;
$$;

grant execute on function public.get_claim_queue() to authenticated;

create policy "Authenticated users can read own support ticket channel"
on realtime.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_tickets st
    where st.agent_id = auth.uid()
      and (
        realtime.topic() = ('support:' || st.id::text)
        or realtime.topic() = ('ticket:' || st.id::text)
      )
  )
);

create policy "Authenticated users can broadcast on own support ticket channel"
on realtime.messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.support_tickets st
    where st.agent_id = auth.uid()
      and (
        realtime.topic() = ('support:' || st.id::text)
        or realtime.topic() = ('ticket:' || st.id::text)
      )
  )
);