-- ============================================================================
-- One-on-one bookings, backlog claims, and formal complaints.
-- Run after 0002_harden_function_grants.sql.
-- ============================================================================

-- ===== BACKLOG CLAIMS =======================================================
-- 'claim' = an order paid for before the portal existed, reported by the
-- client so it can be tracked and delivered.
alter table public.projects
  add column if not exists origin text not null default 'portal'
    check (origin in ('portal', 'claim')),
  add column if not exists ordered_on date;

-- ===== ONE-ON-ONE SESSION BOOKINGS ==========================================
create table if not exists public.session_bookings (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  whatsapp       text,
  session_type   text not null,
  mode           text not null default 'in_person'
                 check (mode in ('in_person', 'online')),
  suburb         text,
  distance_km    numeric(6,1),
  travel_fee     numeric(10,2) not null default 0,
  session_fee    numeric(10,2) not null default 0,
  preferred_date date,
  notes          text,
  status         text not null default 'requested'
                 check (status in ('requested', 'confirmed', 'done', 'cancelled')),
  created_at     timestamptz not null default now()
);
create index if not exists session_bookings_created_idx
  on public.session_bookings (created_at desc);
alter table public.session_bookings enable row level security;

create policy "sessions: anyone books" on public.session_bookings
  for insert to anon, authenticated with check (
    length(trim(name)) between 1 and 120
    and length(trim(email)) between 3 and 200
    and length(coalesce(notes, '')) <= 3000
    and travel_fee >= 0
    and session_fee >= 0
  );
create policy "sessions: admin reads" on public.session_bookings
  for select using (public.is_admin());
create policy "sessions: admin updates" on public.session_bookings
  for update using (public.is_admin()) with check (public.is_admin());

-- ===== COMPLAINTS ===========================================================
-- Not just a message: a category, the date it relates to, and a lifecycle the
-- client can watch. No delete policy anywhere — it cannot be made to vanish.
create table if not exists public.complaints (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  client_id      uuid not null references public.profiles(id) on delete cascade,
  category       text not null check (category in
                   ('late_delivery','not_as_described','no_response','payment','other')),
  incident_date  date,
  body           text not null check (length(trim(body)) > 0),
  status         text not null default 'open'
                 check (status in ('open','acknowledged','resolved')),
  admin_response text,
  responded_at   timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists complaints_project_idx on public.complaints (project_id, created_at desc);
create index if not exists complaints_status_idx  on public.complaints (status);
alter table public.complaints enable row level security;

create policy "complaints: read own or admin" on public.complaints
  for select using (auth.uid() = client_id or public.is_admin());
create policy "complaints: client raises own" on public.complaints
  for insert with check (
    auth.uid() = client_id
    and status = 'open'          -- a client cannot open one pre-resolved
    and admin_response is null
    and exists (select 1 from public.projects p
                where p.id = project_id and p.client_id = auth.uid())
  );
create policy "complaints: admin responds" on public.complaints
  for update using (public.is_admin()) with check (public.is_admin());

do $$ begin
  alter publication supabase_realtime add table public.complaints;
exception when others then null; end $$;

-- ===== ADMIN STATS ==========================================================
create or replace function public.get_admin_stats()
returns jsonb language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  return jsonb_build_object(
    'active_projects',      (select count(*) from public.projects
                             where status not in ('delivered','cancelled')),
    'awaiting_payment',     (select count(*) from public.payments where status = 'pending'),
    'open_complaints',      (select count(*) from public.complaints where status <> 'resolved'),
    'backlog_claims',       (select count(*) from public.projects
                             where origin = 'claim' and status not in ('delivered','cancelled')),
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
