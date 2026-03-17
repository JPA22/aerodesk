-- =============================================================================
-- AeroDesk — Keep aircraft_listings.leads_count in sync via trigger
-- Migration: 009_fix_leads_count_trigger.sql
-- =============================================================================

-- Function: increment leads_count when a lead is inserted
create or replace function increment_listing_leads_count()
returns trigger language plpgsql security definer as $$
begin
  update aircraft_listings
     set leads_count = leads_count + 1
   where id = NEW.listing_id;
  return NEW;
end;
$$;

-- Function: decrement leads_count when a lead is deleted
create or replace function decrement_listing_leads_count()
returns trigger language plpgsql security definer as $$
begin
  update aircraft_listings
     set leads_count = greatest(0, leads_count - 1)
   where id = OLD.listing_id;
  return OLD;
end;
$$;

drop trigger if exists on_lead_inserted on leads;
create trigger on_lead_inserted
  after insert on leads
  for each row execute function increment_listing_leads_count();

drop trigger if exists on_lead_deleted on leads;
create trigger on_lead_deleted
  after delete on leads
  for each row execute function decrement_listing_leads_count();

-- Backfill existing leads_count from actual lead rows
update aircraft_listings al
   set leads_count = (
     select count(*) from leads l where l.listing_id = al.id
   );
