-- =============================================================================
-- AeroDesk — Fix aircraft_listings UPDATE policy to include WITH CHECK
-- Migration: 007_fix_listings_update_policy.sql
-- =============================================================================

-- The original policy used only USING without WITH CHECK.
-- PostgreSQL defaults WITH CHECK to equal USING for UPDATE, but being explicit
-- avoids edge-case behaviour and ensures the policy is applied correctly.

drop policy if exists "listings: owner update" on aircraft_listings;

create policy "listings: owner update"
  on aircraft_listings for update
  to authenticated
  using  (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);
