create table public.devis_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  service text not null,
  message text not null
);

alter table public.devis_requests enable row level security;

create policy "Anyone can submit a quote request"
  on public.devis_requests
  for insert
  to anon
  with check (true);
