-- ============================================================================
-- Forex Dev Client Portal — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

-- ===== ENUMS ================================================================
create type public.app_role       as enum ('admin', 'client');
create type public.service_type   as enum ('ea_build', 'indicator', 'code_review', 'mobile_bot', 'other');
create type public.project_status as enum ('received', 'scoping', 'in_dev', 'testing', 'revision', 'delivered', 'cancelled');
create type public.payment_status as enum ('pending', 'confirmed', 'rejected');
create type public.mt_platform    as enum ('mt4', 'mt5', 'tradingview', 'other');

-- ===== PROFILES =============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  whatsapp    text,
  platform    public.mt_platform,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ===== ROLES ================================================================
-- Roles live in their own table, never on profiles: a client must not be able
-- to grant themselves admin by updating a column on a row they own.
create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- security definer so RLS policies can call it without recursing into user_roles
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

-- ===== PROJECTS =============================================================
create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  -- references profiles (not auth.users) so PostgREST can join client details
  client_id      uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  service        public.service_type not null default 'ea_build',
  status         public.project_status not null default 'received',
  brief          text,
  -- The agreement. Written down, dated, visible to both sides from day one.
  quoted_amount  numeric(12,2),
  currency       text not null default 'ZAR',
  agreed_scope   text,
  due_date       date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index projects_client_id_idx on public.projects (client_id);
create index projects_status_idx    on public.projects (status);
alter table public.projects enable row level security;

-- ===== PROJECT UPDATES (one-way status timeline, admin-authored) ============
create table public.project_updates (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status     public.project_status not null,
  note       text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index project_updates_project_id_idx on public.project_updates (project_id, created_at desc);
alter table public.project_updates enable row level security;

-- ===== PROJECT MESSAGES (two-way thread) ====================================
-- This is the complaint surface. Every message is attributed and timestamped
-- and neither side can edit or delete one after the fact.
create table public.project_messages (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id  uuid not null references auth.users(id),
  body       text not null check (length(trim(body)) > 0),
  from_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create index project_messages_project_id_idx on public.project_messages (project_id, created_at);
alter table public.project_messages enable row level security;

-- ===== PAYMENTS =============================================================
create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  client_id    uuid not null references public.profiles(id) on delete cascade,
  proof_path   text not null,
  amount       numeric(12,2),
  currency     text not null default 'ZAR',
  reference    text,
  status       public.payment_status not null default 'pending',
  admin_note   text,
  reviewed_by  uuid references auth.users(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index payments_project_id_idx on public.payments (project_id);
alter table public.payments enable row level security;

-- ===== DELIVERABLES =========================================================
create table public.deliverables (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  file_path   text not null,
  file_name   text not null,
  notes       text,
  -- Admin decides when the client can download. Nothing leaks early.
  released    boolean not null default false,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);
create index deliverables_project_id_idx on public.deliverables (project_id);
alter table public.deliverables enable row level security;

-- ===== AI INTAKE CHATS ======================================================
create table public.ai_intake_chats (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id  uuid not null references auth.users(id) on delete cascade,
  transcript jsonb not null default '[]'::jsonb,
  summary    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id)
);
alter table public.ai_intake_chats enable row level security;

-- ===== TESTIMONIALS (public results) ========================================
create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  client_name   text not null,
  quote         text,
  image_path    text,
  service       public.service_type,
  is_published  boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);
alter table public.testimonials enable row level security;

-- ===== QUOTE REQUESTS =======================================================
-- Public intake. Captures both people who proceed and people who decline on
-- price — the declines are the more useful half of the data.
create table public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  whatsapp      text,
  service       public.service_type not null default 'ea_build',
  path          text not null check (path in ('budget', 'enquiry')),
  budget_band   text,
  system_notes  text,
  questions     text,
  outcome       text not null default 'proceeding'
                check (outcome in ('proceeding', 'declined')),
  handled       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index quote_requests_created_idx on public.quote_requests (created_at desc);
alter table public.quote_requests enable row level security;

-- ===== SPECIALS =============================================================
create table public.specials (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  discount_label text,
  active       boolean not null default false,
  starts_at    timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);
alter table public.specials enable row level security;

-- ===== RLS POLICIES =========================================================

-- profiles ------------------------------------------------------------------
create policy "profiles: read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- user_roles ----------------------------------------------------------------
create policy "roles: read own or admin" on public.user_roles
  for select using (auth.uid() = user_id or public.is_admin());
create policy "roles: admin writes" on public.user_roles
  for all using (public.is_admin()) with check (public.is_admin());

-- projects ------------------------------------------------------------------
create policy "projects: read own or admin" on public.projects
  for select using (auth.uid() = client_id or public.is_admin());
create policy "projects: client creates own" on public.projects
  for insert with check (auth.uid() = client_id);
-- Clients may edit only their own brief/title while the job is still forming;
-- status, scope, price and due date are admin-only (enforced in trigger below).
create policy "projects: owner or admin updates" on public.projects
  for update using (auth.uid() = client_id or public.is_admin());
create policy "projects: admin deletes" on public.projects
  for delete using (public.is_admin());

create or replace function public.guard_project_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  -- non-admins cannot move the commercial goalposts
  if new.status        is distinct from old.status
     or new.quoted_amount is distinct from old.quoted_amount
     or new.currency   is distinct from old.currency
     or new.agreed_scope is distinct from old.agreed_scope
     or new.due_date    is distinct from old.due_date
     or new.client_id   is distinct from old.client_id then
    raise exception 'Only an admin can change status, scope, price, due date or owner';
  end if;
  return new;
end $$;

create trigger trg_projects_guard
  before update on public.projects
  for each row execute function public.guard_project_update();

-- project_updates -----------------------------------------------------------
create policy "updates: read if project visible" on public.project_updates
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin())
    )
  );
create policy "updates: admin inserts" on public.project_updates
  for insert with check (public.is_admin() and created_by = auth.uid());

-- project_messages ----------------------------------------------------------
create policy "messages: read if project visible" on public.project_messages
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin())
    )
  );
create policy "messages: participants insert" on public.project_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and (p.client_id = auth.uid() or public.is_admin())
    )
    and from_admin = public.is_admin()
  );
-- deliberately no update/delete policy: the thread is append-only

-- payments ------------------------------------------------------------------
create policy "payments: read own or admin" on public.payments
  for select using (auth.uid() = client_id or public.is_admin());
create policy "payments: client submits own" on public.payments
  for insert with check (
    auth.uid() = client_id
    and status = 'pending'   -- a client can never self-confirm
    and exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );
create policy "payments: admin reviews" on public.payments
  for update using (public.is_admin()) with check (public.is_admin());

-- deliverables --------------------------------------------------------------
create policy "deliverables: released to owner, all to admin" on public.deliverables
  for select using (
    public.is_admin()
    or (released and exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    ))
  );
create policy "deliverables: admin writes" on public.deliverables
  for all using (public.is_admin()) with check (public.is_admin());

-- ai_intake_chats -----------------------------------------------------------
create policy "intake: read own or admin" on public.ai_intake_chats
  for select using (auth.uid() = client_id or public.is_admin());
create policy "intake: client writes own" on public.ai_intake_chats
  for insert with check (auth.uid() = client_id);
create policy "intake: client updates own" on public.ai_intake_chats
  for update using (auth.uid() = client_id) with check (auth.uid() = client_id);

-- quote_requests ------------------------------------------------------------
-- Anyone may submit one; only an admin can ever read them back.
create policy "quotes: anyone submits" on public.quote_requests
  for insert to anon, authenticated with check (
    length(trim(name)) between 1 and 120
    and length(trim(email)) between 3 and 200
    and length(coalesce(system_notes, '')) <= 5000
    and length(coalesce(questions, '')) <= 5000
  );
create policy "quotes: admin reads" on public.quote_requests
  for select using (public.is_admin());
create policy "quotes: admin updates" on public.quote_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- testimonials --------------------------------------------------------------
create policy "testimonials: public reads published" on public.testimonials
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "testimonials: admin writes" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- specials ------------------------------------------------------------------
create policy "specials: public reads active" on public.specials
  for select to anon, authenticated using (
    (active
      and (starts_at is null or starts_at <= now())
      and (ends_at   is null or ends_at   >= now()))
    or public.is_admin()
  );
create policy "specials: admin writes" on public.specials
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== TRIGGERS =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_updated  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_projects_updated  before update on public.projects
  for each row execute function public.set_updated_at();
create trigger trg_intake_updated    before update on public.ai_intake_chats
  for each row execute function public.set_updated_at();

-- New signups become clients. Admin is granted explicitly, never by signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'client')
  on conflict do nothing;
  return new;
end $$;

-- Skip this statement if the project already has an on_auth_user_created
-- trigger on auth.users — replacing handle_new_user() above is enough, the
-- existing trigger will call the new body.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mirror every status change into the timeline so the client always sees why.
create or replace function public.log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.project_updates (project_id, status, note, created_by)
    values (new.id, new.status, null, coalesce(auth.uid(), new.client_id));
  end if;
  return new;
end $$;

create trigger trg_projects_log_status
  after update on public.projects
  for each row execute function public.log_status_change();

-- ===== RPCs =================================================================

-- First authenticated caller becomes admin; every later call fails.
create or replace function public.bootstrap_admin()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.user_roles where role = 'admin') then
    raise exception 'Bootstrap already complete: an admin already exists';
  end if;
  if auth.uid() is null then
    raise exception 'Must be signed in';
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict (user_id, role) do nothing;
  return jsonb_build_object('ok', true, 'user_id', auth.uid());
end $$;
revoke all on function public.bootstrap_admin() from public;
grant execute on function public.bootstrap_admin() to authenticated;

create or replace function public.admin_exists()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where role = 'admin') $$;
revoke all on function public.admin_exists() from public;
grant execute on function public.admin_exists() to anon, authenticated;

create or replace function public.get_admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  return jsonb_build_object(
    'active_projects',      (select count(*) from public.projects
                             where status not in ('delivered','cancelled')),
    'awaiting_payment',     (select count(*) from public.payments where status = 'pending'),
    'unanswered_messages',  (select count(distinct m.project_id)
                             from public.project_messages m
                             where m.from_admin = false
                               and not exists (
                                 select 1 from public.project_messages r
                                 where r.project_id = m.project_id
                                   and r.from_admin = true
                                   and r.created_at > m.created_at
                               )),
    'stale_projects',       (select count(*) from public.projects p
                             where p.status not in ('delivered','cancelled')
                               and coalesce(
                                     (select max(u.created_at) from public.project_updates u
                                      where u.project_id = p.id),
                                     p.created_at
                                   ) < now() - interval '7 days'),
    'delivered_this_month', (select count(*) from public.projects
                             where status = 'delivered'
                               and updated_at >= date_trunc('month', now())),
    'total_clients',        (select count(*) from public.user_roles where role = 'client')
  );
end $$;
revoke all on function public.get_admin_stats() from public;
grant execute on function public.get_admin_stats() to authenticated;

-- ===== STORAGE ==============================================================
insert into storage.buckets (id, name, public) values
  ('payment-proofs', 'payment-proofs', false),
  ('deliverables',   'deliverables',   false),
  ('results',        'results',        true)
on conflict (id) do nothing;

-- payment-proofs: client writes into their own {uid}/ prefix, admin reads all
create policy "pop: owner or admin reads" on storage.objects for select using (
  bucket_id = 'payment-proofs'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);
create policy "pop: owner writes" on storage.objects for insert with check (
  bucket_id = 'payment-proofs' and auth.uid()::text = (storage.foldername(name))[1]
);

-- deliverables: admin writes, project owner reads their own prefix
create policy "deliverables: owner or admin reads" on storage.objects for select using (
  bucket_id = 'deliverables'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);
create policy "deliverables: admin writes" on storage.objects for insert with check (
  bucket_id = 'deliverables' and public.is_admin()
);

-- results: public read, admin write
create policy "results: public reads" on storage.objects for select using (bucket_id = 'results');
create policy "results: admin writes" on storage.objects for insert with check (
  bucket_id = 'results' and public.is_admin()
);
create policy "results: admin updates" on storage.objects for update using (
  bucket_id = 'results' and public.is_admin()
);

-- ===== REALTIME (optional; safe if the publication already has the table) ===
do $$ begin
  alter publication supabase_realtime add table public.project_messages;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.project_updates;
exception when others then null; end $$;
