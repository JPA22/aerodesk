-- =============================================================================
-- AeroDesk — Fix leads insert, saved_listings policy, backfill profiles
-- Migration: 006_fix_leads_rls.sql
-- =============================================================================

-- 1. saved_listings: add explicit WITH CHECK so INSERT works correctly
--    (FOR ALL with only USING doesn't guarantee WITH CHECK behavior for INSERT)
drop policy if exists "saved_listings: owner all" on saved_listings;
create policy "saved_listings: owner all"
  on saved_listings for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. leads: ensure INSERT policy is explicit and has WITH CHECK
drop policy if exists "leads: authenticated insert" on leads;
create policy "leads: authenticated insert"
  on leads for insert
  to authenticated
  with check (auth.uid() = buyer_id);

-- 3. Backfill profiles for any auth users missing a row.
--    The handle_new_user trigger should do this on signup, but this covers
--    users created before the trigger was installed.
insert into public.profiles (id)
select id from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
