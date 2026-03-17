-- =============================================================================
-- AeroDesk — Nuclear RLS fix: drop and recreate all policies cleanly
-- Migration: 011_fix_all_rls.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- aircraft_listings — drop ALL existing policies and recreate
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "listings: public read active"      ON aircraft_listings;
DROP POLICY IF EXISTS "listings: authenticated insert"    ON aircraft_listings;
DROP POLICY IF EXISTS "listings: owner update"            ON aircraft_listings;
DROP POLICY IF EXISTS "listings: owner delete"            ON aircraft_listings;
DROP POLICY IF EXISTS "listings_select"                   ON aircraft_listings;
DROP POLICY IF EXISTS "listings_insert"                   ON aircraft_listings;
DROP POLICY IF EXISTS "listings_update"                   ON aircraft_listings;
DROP POLICY IF EXISTS "listings_delete"                   ON aircraft_listings;

-- Public can read active listings OR their own listings
CREATE POLICY "listings_select"
  ON aircraft_listings FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

-- Authenticated users can insert their own listings
CREATE POLICY "listings_insert"
  ON aircraft_listings FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- Owners can update ANY column on their own listings
CREATE POLICY "listings_update"
  ON aircraft_listings FOR UPDATE
  TO authenticated
  USING  (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Owners can delete their own listings
CREATE POLICY "listings_delete"
  ON aircraft_listings FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- ---------------------------------------------------------------------------
-- saved_listings — drop ALL existing policies and recreate explicitly
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "saved_listings: owner all"    ON saved_listings;
DROP POLICY IF EXISTS "saved_listings: owner select" ON saved_listings;
DROP POLICY IF EXISTS "saved_listings: owner insert" ON saved_listings;
DROP POLICY IF EXISTS "saved_listings: owner delete" ON saved_listings;
DROP POLICY IF EXISTS "saved_select"                 ON saved_listings;
DROP POLICY IF EXISTS "saved_insert"                 ON saved_listings;
DROP POLICY IF EXISTS "saved_delete"                 ON saved_listings;

CREATE POLICY "saved_select"
  ON saved_listings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "saved_insert"
  ON saved_listings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_delete"
  ON saved_listings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Idempotent: add sale-detail columns if not already present
-- ---------------------------------------------------------------------------

ALTER TABLE aircraft_listings
  ADD COLUMN IF NOT EXISTS sale_price   numeric,
  ADD COLUMN IF NOT EXISTS buyer_name   text,
  ADD COLUMN IF NOT EXISTS buyer_email  text,
  ADD COLUMN IF NOT EXISTS buyer_phone  text,
  ADD COLUMN IF NOT EXISTS sale_notes   text,
  ADD COLUMN IF NOT EXISTS sold_at      timestamptz;
