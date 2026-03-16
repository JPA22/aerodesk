-- =============================================================================
-- AeroDesk — Fix / harden RLS policies
-- Migration: 002_fix_policies.sql
-- =============================================================================

-- Ensure manufacturers are readable without auth (anon + authenticated)
drop policy if exists "manufacturers: public read" on manufacturers;
create policy "manufacturers: public read"
  on manufacturers for select
  to anon, authenticated
  using (true);

-- Ensure aircraft_models are readable without auth
drop policy if exists "aircraft_models: public read" on aircraft_models;
create policy "aircraft_models: public read"
  on aircraft_models for select
  to anon, authenticated
  using (true);

-- Allow authenticated users to insert new aircraft_models (custom model flow)
drop policy if exists "aircraft_models: authenticated insert" on aircraft_models;
create policy "aircraft_models: authenticated insert"
  on aircraft_models for insert
  to authenticated
  with check (true);

-- Ensure listing_images insert policy references the right authenticated seller
-- (drop and recreate to guarantee it's applied)
drop policy if exists "listing_images: seller insert" on listing_images;
create policy "listing_images: seller insert"
  on listing_images for insert
  to authenticated
  with check (
    auth.uid() = (
      select seller_id from aircraft_listings where id = listing_id
    )
  );

-- Profiles: allow authenticated users to upsert their own profile
-- (handles users created before the on_auth_user_created trigger was installed)
drop policy if exists "profiles: owner insert" on profiles;
create policy "profiles: owner insert"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Ensure the aircraft_listings insert policy is scoped to authenticated role
drop policy if exists "listings: authenticated insert" on aircraft_listings;
create policy "listings: authenticated insert"
  on aircraft_listings for insert
  to authenticated
  with check (auth.uid() = seller_id);
