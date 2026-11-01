-- Espace client : profils, projets, étapes, fichiers, contrats.
-- Toutes les écritures passent par des Server Actions avec la clé service_role
-- (après vérification manuelle de l'identité et du rôle), donc aucune policy
-- d'écriture n'est ouverte aux utilisateurs authentifiés ici : seule la lecture
-- de leurs propres données est autorisée directement par RLS.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'admin')),
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz not null default now()
);

create table public.project_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label text not null,
  position integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'awaiting_client', 'done')),
  created_at timestamptz not null default now()
);

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  locale text not null default 'fr' check (locale in ('fr', 'zh')),
  type text not null check (type in ('discussion', 'precontract', 'signature')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'completed')),
  fields_schema jsonb not null default '[]',
  responses jsonb not null default '{}',
  pdf_path text,
  signature_data text,
  signed_at timestamptz,
  sha256_hash text,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Fonction security definer : évite la récursion RLS en lisant profiles
-- sans repasser par ses propres policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_steps enable row level security;
alter table public.project_files enable row level security;
alter table public.contracts enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "projects_select_own_or_admin" on public.projects
  for select to authenticated
  using (client_id = auth.uid() or public.is_admin());

create policy "project_steps_select_own_or_admin" on public.project_steps
  for select to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_steps.project_id
        and (projects.client_id = auth.uid() or public.is_admin())
    )
  );

create policy "project_files_select_own_or_admin" on public.project_files
  for select to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_files.project_id
        and (projects.client_id = auth.uid() or public.is_admin())
    )
  );

create policy "contracts_select_own_or_admin" on public.contracts
  for select to authenticated
  using (client_id = auth.uid() or public.is_admin());

-- Buckets de stockage privés (accès exclusivement via Server Actions service_role,
-- qui génèrent des URLs signées après vérification de propriété).
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('contract-pdfs', 'contract-pdfs', false)
on conflict (id) do nothing;
