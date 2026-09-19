-- Corrective migration — fixes infinite RLS recursion (SQLSTATE 42P17).
-- Does not modify 0001, 0002 or 0003.
--
-- Problem: the policies "manager admin read all users" (users, 0001) and
-- "manager admin read catalogue prices" (catalogue_unit_prices, 0003) both ran
-- `exists (select 1 from users ...)`. Evaluating that subquery re-applies the RLS
-- policies on `users`, which query `users` again -> infinite recursion.
--
-- Fix: move the role lookup into a SECURITY DEFINER helper. It runs as the
-- function owner (postgres), which is not subject to the RLS on `users`, so no
-- policy is re-entered. Authorization semantics are unchanged: MANAGER/ADMIN only.

create or replace function public.is_manager_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('MANAGER', 'ADMIN')
  );
$$;

-- Same convention as 0002: no default PUBLIC execute; explicit grants only.
-- anon is revoked explicitly because Supabase default privileges grant it directly.
revoke all on function public.is_manager_or_admin() from public, anon;
grant execute on function public.is_manager_or_admin() to authenticated, service_role;

-- users: recreate the manager/admin policy without the self-referencing subquery.
-- "staff read own user row" (auth.uid() = id) is untouched.
drop policy if exists "manager admin read all users" on users;
create policy "manager admin read all users" on users
  for select to authenticated
  using (public.is_manager_or_admin());

-- catalogue_unit_prices: same helper. Still no anon policy -> anon is default-denied.
drop policy if exists "manager admin read catalogue prices" on catalogue_unit_prices;
create policy "manager admin read catalogue prices" on catalogue_unit_prices
  for select to authenticated
  using (public.is_manager_or_admin());

-- create_rfq_submission: 0002 intended service_role-only execution, but
-- `revoke ... from public` does not remove the direct grants Supabase gives
-- anon/authenticated. The only caller is app/api/rfq/route.ts using the
-- service-role client; no browser/anon code path calls this RPC, so the
-- direct grants are removed. Public RFQ submission is unaffected (it goes
-- through the API route).
revoke all on function create_rfq_submission(
  text, text, text, business_type, text, text, text, container_type,
  boolean, text, text, text, jsonb
) from public, anon, authenticated;

grant execute on function create_rfq_submission(
  text, text, text, business_type, text, text, text, container_type,
  boolean, text, text, text, jsonb
) to service_role;
