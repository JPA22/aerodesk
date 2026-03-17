-- =============================================================================
-- AeroDesk — Fix RLS policies for listings UPDATE and saved_listings
-- Migration: 010_fix_rls_persistence.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. aircraft_listings: ensure UPDATE policy has explicit WITH CHECK
--    (consolidates migration 007 — idempotent)
-- ---------------------------------------------------------------------------

drop policy if exists "listings: owner update" on aircraft_listings;

create policy "listings: owner update"
  on aircraft_listings for update
  to authenticated
  using  (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- ---------------------------------------------------------------------------
-- 2. saved_listings: replace "owner all" with explicit per-operation policies
--    The "for all" shorthand can behave unexpectedly for INSERT WITH CHECK.
--    Explicit policies guarantee each operation is guarded correctly.
-- ---------------------------------------------------------------------------

drop policy if exists "saved_listings: owner all"    on saved_listings;
drop policy if exists "saved_listings: owner select" on saved_listings;
drop policy if exists "saved_listings: owner insert" on saved_listings;
drop policy if exists "saved_listings: owner delete" on saved_listings;

create policy "saved_listings: owner select"
  on saved_listings for select
  using (auth.uid() = user_id);

create policy "saved_listings: owner insert"
  on saved_listings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "saved_listings: owner delete"
  on saved_listings for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Add sale-detail columns if missing (idempotent — covers missing 008)
-- ---------------------------------------------------------------------------

alter table aircraft_listings
  add column if not exists sale_price   numeric,
  add column if not exists buyer_name   text,
  add column if not exists buyer_email  text,
  add column if not exists buyer_phone  text,
  add column if not exists sale_notes   text,
  add column if not exists sold_at      timestamptz;
