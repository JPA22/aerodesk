-- =============================================================================
-- AeroDesk — Fix RLS policies for public search access
-- Migration: 005_fix_search_rls.sql
-- =============================================================================

-- aircraft_listings: explicitly grant SELECT to anon + authenticated roles
-- Without explicit TO clause, the policy defaults to PUBLIC but some Supabase
-- versions require explicit role targeting for anon queries.
drop policy if exists "listings: public read active" on aircraft_listings;
create policy "listings: public read active"
  on aircraft_listings for select
  to anon, authenticated
  using (status = 'active' or auth.uid() = seller_id);

-- listing_images: same — explicitly grant anon access
drop policy if exists "listing_images: public read" on listing_images;
create policy "listing_images: public read"
  on listing_images for select
  to anon, authenticated
  using (true);

-- saved_listings: keep owner-only for writes, but anon needs no access
-- (already correct, no change needed)

-- Add increment_views RPC function (used by listing detail page)
create or replace function increment_views(listing_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update aircraft_listings
  set views_count = views_count + 1
  where id = listing_id;
end;
$$;
