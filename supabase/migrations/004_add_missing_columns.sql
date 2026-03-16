-- =============================================================================
-- AeroDesk — Safety migration: ensure new columns exist
-- Migration: 004_add_missing_columns.sql
-- Safe to run even if 003 already added these columns (IF NOT EXISTS guard)
-- =============================================================================

ALTER TABLE aircraft_listings
  ADD COLUMN IF NOT EXISTS passenger_seats int,
  ADD COLUMN IF NOT EXISTS galley_config   text;
