-- ============================================================================
-- Hardening pass, from the Supabase security advisor.
-- Run after 0001_init.sql.
-- ============================================================================

-- Pin the search_path on the trigger helper.
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public
as $$
begin new.updated_at = now(); return new; end $$;

-- Every SECURITY DEFINER function is exposed at /rest/v1/rpc/<name> by default.
-- has_role() being anon-callable let anyone probe "is this uuid an admin?".
-- It is only ever called from inside is_admin(), which runs as its owner, so
-- revoking public access does not affect RLS.
revoke all on function public.has_role(uuid, public.app_role) from anon, authenticated, public;

-- Trigger functions are never meant to be invoked directly.
revoke all on function public.guard_project_update() from anon, authenticated, public;
revoke all on function public.log_status_change()    from anon, authenticated, public;
revoke all on function public.handle_new_user()      from anon, authenticated, public;
revoke all on function public.set_updated_at()       from anon, authenticated, public;

-- is_admin() MUST stay callable. RLS policy expressions evaluate as the
-- querying role, and the public testimonials/specials policies call it as anon.
grant execute on function public.is_admin() to anon, authenticated;
