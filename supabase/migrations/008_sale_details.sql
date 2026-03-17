-- =============================================================================
-- AeroDesk — Add sale details columns to aircraft_listings
-- Migration: 008_sale_details.sql
-- =============================================================================

alter table aircraft_listings
  add column if not exists sale_price   numeric,
  add column if not exists buyer_name   text,
  add column if not exists buyer_email  text,
  add column if not exists buyer_phone  text,
  add column if not exists sale_notes   text,
  add column if not exists sold_at      timestamptz;
