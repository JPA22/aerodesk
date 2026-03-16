-- =============================================================================
-- AeroDesk — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

create type user_role as enum ('buyer', 'private_seller', 'dealer', 'admin');

create type subscription_tier as enum ('basic', 'premium', 'enterprise');

create type subscription_status as enum ('active', 'trial', 'expired');

create type aircraft_category as enum ('jet', 'turboprop', 'piston', 'helicopter');

create type engine_program_status as enum ('enrolled', 'not_enrolled', 'na');

create type listing_status as enum ('draft', 'active', 'pending_review', 'sold', 'expired');

create type lead_contact_method as enum ('email', 'phone', 'whatsapp');

create type lead_status as enum ('new', 'contacted', 'qualified', 'closed');

create type search_alert_frequency as enum ('instant', 'daily', 'weekly');

-- ---------------------------------------------------------------------------
-- UTILITY: updated_at trigger function
-- ---------------------------------------------------------------------------

create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. PROFILES
-- Extends auth.users — one row per Supabase Auth user.
-- ---------------------------------------------------------------------------

create table profiles (
  id                 uuid        primary key references auth.users(id) on delete cascade,
  full_name          text,
  avatar_url         text,
  phone              text,
  role               user_role   not null default 'buyer',
  preferred_language text        not null default 'pt-BR',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

-- Auto-create profile row when a user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. DEALER PROFILES
-- Additional info for users who are brokers / dealers.
-- ---------------------------------------------------------------------------

create table dealer_profiles (
  id                  uuid               primary key default gen_random_uuid(),
  user_id             uuid               not null references profiles(id) on delete cascade,
  company_name        text               not null,
  cnpj                text,
  website             text,
  description         text,
  logo_url            text,
  subscription_tier   subscription_tier  not null default 'basic',
  subscription_status subscription_status not null default 'trial',
  verified            boolean            not null default false,
  verified_at         timestamptz,
  created_at          timestamptz        not null default now(),
  updated_at          timestamptz        not null default now(),

  constraint dealer_profiles_user_id_unique unique (user_id)
);

create trigger dealer_profiles_updated_at
  before update on dealer_profiles
  for each row execute procedure update_updated_at();

-- ---------------------------------------------------------------------------
-- 3. MANUFACTURERS
-- Aircraft OEMs — read-only for end users, managed by admins.
-- ---------------------------------------------------------------------------

create table manufacturers (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null unique,
  country        text,
  logo_url       text,
  aircraft_count int         not null default 0,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. AIRCRAFT MODELS
-- Reference table: make/model combinations with typical performance specs.
-- ---------------------------------------------------------------------------

create table aircraft_models (
  id                uuid             primary key default gen_random_uuid(),
  manufacturer_id   uuid             not null references manufacturers(id) on delete restrict,
  name              text             not null,
  category          aircraft_category not null,
  typical_range_nm  int,
  typical_speed_kts int,
  typical_seats     int,
  created_at        timestamptz      not null default now(),

  constraint aircraft_models_unique unique (manufacturer_id, name)
);

-- ---------------------------------------------------------------------------
-- 5. AIRCRAFT LISTINGS
-- Core entity — an aircraft for sale.
-- ---------------------------------------------------------------------------

create table aircraft_listings (
  id                   uuid                  primary key default gen_random_uuid(),
  seller_id            uuid                  not null references profiles(id) on delete cascade,
  dealer_id            uuid                  references dealer_profiles(id) on delete set null,
  aircraft_model_id    uuid                  not null references aircraft_models(id) on delete restrict,

  -- Listing copy
  title                text                  not null,
  description          text,

  -- Aircraft identity
  registration_number  text,
  year                 int                   not null,
  serial_number        text,

  -- Airframe & engine hours (TT / SMOH)
  total_time_hours     numeric,
  engine_time_smoh     numeric,

  -- Pricing
  asking_price         numeric               not null,
  currency             text                  not null default 'USD',

  -- Location
  location_city        text,
  location_state       text,
  location_country     text                  not null default 'Brazil',

  -- Technical details
  avionics_description text,
  engine_program       engine_program_status not null default 'na',
  maintenance_status   text,
  condition_rating     int                   check (condition_rating between 1 and 10),

  -- Workflow
  status               listing_status        not null default 'draft',
  featured             boolean               not null default false,
  views_count          int                   not null default 0,
  leads_count          int                   not null default 0,
  published_at         timestamptz,

  created_at           timestamptz           not null default now(),
  updated_at           timestamptz           not null default now()
);

create trigger aircraft_listings_updated_at
  before update on aircraft_listings
  for each row execute procedure update_updated_at();

-- ---------------------------------------------------------------------------
-- 6. LISTING IMAGES
-- ---------------------------------------------------------------------------

create table listing_images (
  id            uuid        primary key default gen_random_uuid(),
  listing_id    uuid        not null references aircraft_listings(id) on delete cascade,
  image_url     text        not null,
  display_order int         not null default 0,
  is_primary    boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. LEADS
-- Buyer inquiries on a listing.
-- ---------------------------------------------------------------------------

create table leads (
  id             uuid               primary key default gen_random_uuid(),
  listing_id     uuid               not null references aircraft_listings(id) on delete cascade,
  buyer_id       uuid               not null references profiles(id) on delete cascade,
  message        text,
  contact_method lead_contact_method not null default 'email',
  status         lead_status         not null default 'new',
  created_at     timestamptz         not null default now(),
  updated_at     timestamptz         not null default now()
);

create trigger leads_updated_at
  before update on leads
  for each row execute procedure update_updated_at();

-- ---------------------------------------------------------------------------
-- 8. SAVED LISTINGS
-- Buyer wishlist / watchlist.
-- ---------------------------------------------------------------------------

create table saved_listings (
  user_id    uuid        not null references profiles(id) on delete cascade,
  listing_id uuid        not null references aircraft_listings(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (user_id, listing_id)
);

-- ---------------------------------------------------------------------------
-- 9. SEARCH ALERTS
-- Saved searches — notifies buyers when matching listings appear.
-- ---------------------------------------------------------------------------

create table search_alerts (
  id        uuid                   primary key default gen_random_uuid(),
  user_id   uuid                   not null references profiles(id) on delete cascade,
  filters   jsonb                  not null default '{}',
  frequency search_alert_frequency not null default 'daily',
  active    boolean                not null default true,
  created_at timestamptz           not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

create index idx_listings_status_published   on aircraft_listings(status, published_at desc);
create index idx_listings_model              on aircraft_listings(aircraft_model_id);
create index idx_listings_price              on aircraft_listings(asking_price);
create index idx_listings_country            on aircraft_listings(location_country);
create index idx_listings_seller             on aircraft_listings(seller_id);
create index idx_listings_dealer             on aircraft_listings(dealer_id);
create index idx_listings_featured           on aircraft_listings(featured) where featured = true;
create index idx_leads_listing               on leads(listing_id);
create index idx_leads_buyer                 on leads(buyer_id);
create index idx_listing_images_listing      on listing_images(listing_id, display_order);
create index idx_search_alerts_user          on search_alerts(user_id) where active = true;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

-- profiles
alter table profiles enable row level security;

create policy "profiles: public read"
  on profiles for select using (true);

create policy "profiles: owner insert"
  on profiles for insert with check (auth.uid() = id);

create policy "profiles: owner update"
  on profiles for update using (auth.uid() = id);

-- dealer_profiles
alter table dealer_profiles enable row level security;

create policy "dealer_profiles: public read"
  on dealer_profiles for select using (true);

create policy "dealer_profiles: owner insert"
  on dealer_profiles for insert with check (auth.uid() = user_id);

create policy "dealer_profiles: owner update"
  on dealer_profiles for update using (auth.uid() = user_id);

-- manufacturers (public read-only; writes via service role only)
alter table manufacturers enable row level security;

create policy "manufacturers: public read"
  on manufacturers for select using (true);

-- aircraft_models (public read-only)
alter table aircraft_models enable row level security;

create policy "aircraft_models: public read"
  on aircraft_models for select using (true);

-- aircraft_listings
alter table aircraft_listings enable row level security;

create policy "listings: public read active"
  on aircraft_listings for select
  using (status = 'active' or auth.uid() = seller_id);

create policy "listings: authenticated insert"
  on aircraft_listings for insert
  to authenticated
  with check (auth.uid() = seller_id);

create policy "listings: owner update"
  on aircraft_listings for update
  using (auth.uid() = seller_id);

create policy "listings: owner delete"
  on aircraft_listings for delete
  using (auth.uid() = seller_id);

-- listing_images
alter table listing_images enable row level security;

create policy "listing_images: public read"
  on listing_images for select using (true);

create policy "listing_images: seller insert"
  on listing_images for insert
  with check (
    auth.uid() = (
      select seller_id from aircraft_listings where id = listing_id
    )
  );

create policy "listing_images: seller delete"
  on listing_images for delete
  using (
    auth.uid() = (
      select seller_id from aircraft_listings where id = listing_id
    )
  );

-- leads
alter table leads enable row level security;

create policy "leads: authenticated insert"
  on leads for insert
  to authenticated
  with check (auth.uid() = buyer_id);

create policy "leads: buyer or seller read"
  on leads for select
  using (
    auth.uid() = buyer_id
    or auth.uid() = (
      select seller_id from aircraft_listings where id = listing_id
    )
  );

create policy "leads: seller update status"
  on leads for update
  using (
    auth.uid() = (
      select seller_id from aircraft_listings where id = listing_id
    )
  );

-- saved_listings
alter table saved_listings enable row level security;

create policy "saved_listings: owner all"
  on saved_listings for all
  using (auth.uid() = user_id);

-- search_alerts
alter table search_alerts enable row level security;

create policy "search_alerts: owner all"
  on search_alerts for all
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- SEED DATA — Manufacturers
-- ---------------------------------------------------------------------------

insert into manufacturers (name, country) values
  ('Cessna',             'United States'),
  ('Embraer',            'Brazil'),
  ('Bombardier',         'Canada'),
  ('Gulfstream',         'United States'),
  ('Beechcraft',         'United States'),
  ('Piper',              'United States'),
  ('Dassault',           'France'),
  ('Pilatus',            'Switzerland'),
  ('Cirrus',             'United States'),
  ('Daher',              'France'),
  ('Robinson',           'United States'),
  ('Airbus Helicopters', 'France'),
  ('Bell',               'United States');

-- ---------------------------------------------------------------------------
-- SEED DATA — Aircraft Models
-- ---------------------------------------------------------------------------

-- Jets
insert into aircraft_models (manufacturer_id, name, category, typical_range_nm, typical_speed_kts, typical_seats)
select m.id, v.name, 'jet', v.range_nm, v.speed_kts, v.seats
from manufacturers m
join (values
  ('Cessna',      'Citation CJ4',      2165, 451,  9),
  ('Cessna',      'Citation Latitude', 2700, 446,  9),
  ('Embraer',     'Phenom 300E',       2010, 453,  9),
  ('Embraer',     'Phenom 100EV',      1178, 406,  6),
  ('Embraer',     'Praetor 500',       3340, 466,  9),
  ('Embraer',     'Legacy 450',        2904, 466,  9),
  ('Bombardier',  'Challenger 350',    3200, 459, 10),
  ('Bombardier',  'Global 6500',       6600, 516, 12),
  ('Gulfstream',  'G280',              3600, 482, 10),
  ('Gulfstream',  'G550',              6750, 488, 16),
  ('Dassault',    'Falcon 2000LXS',    4000, 480, 10),
  ('Dassault',    'Falcon 6X',         5950, 481, 16)
) as v(manufacturer, name, range_nm, speed_kts, seats)
  on m.name = v.manufacturer;

-- Turboprops
insert into aircraft_models (manufacturer_id, name, category, typical_range_nm, typical_speed_kts, typical_seats)
select m.id, v.name, 'turboprop', v.range_nm, v.speed_kts, v.seats
from manufacturers m
join (values
  ('Beechcraft', 'King Air 350',    1806, 312, 11),
  ('Beechcraft', 'King Air 250',    1720, 302,  9),
  ('Cessna',     'Grand Caravan EX', 1025, 175, 14),
  ('Daher',      'TBM 960',         1730, 330,  6),
  ('Pilatus',    'PC-12 NGX',       1803, 290,  9),
  ('Piper',      'M600/SLS',        1484, 274,  6)
) as v(manufacturer, name, range_nm, speed_kts, seats)
  on m.name = v.manufacturer;

-- Pistons
insert into aircraft_models (manufacturer_id, name, category, typical_range_nm, typical_speed_kts, typical_seats)
select m.id, v.name, 'piston', v.range_nm, v.speed_kts, v.seats
from manufacturers m
join (values
  ('Cirrus',     'SR22T',       1021, 183, 4),
  ('Cirrus',     'SR20',         700, 155, 4),
  ('Beechcraft', 'Bonanza G36',  926, 176, 6),
  ('Piper',      'Archer TX',    522, 128, 4),
  ('Piper',      'Seneca V',     800, 161, 6),
  ('Cessna',     '182 Skylane',  915, 145, 4),
  ('Cessna',     '172 Skyhawk',  640, 122, 4)
) as v(manufacturer, name, range_nm, speed_kts, seats)
  on m.name = v.manufacturer;

-- Helicopters
insert into aircraft_models (manufacturer_id, name, category, typical_range_nm, typical_speed_kts, typical_seats)
select m.id, v.name, 'helicopter', v.range_nm, v.speed_kts, v.seats
from manufacturers m
join (values
  ('Robinson',           'R44 Raven II', 300, 109,  4),
  ('Robinson',           'R66 Turbine',  350, 120,  5),
  ('Airbus Helicopters', 'H125',         331, 134,  7),
  ('Airbus Helicopters', 'H145',         403, 150, 11),
  ('Bell',               '407GXi',       330, 133,  7),
  ('Bell',               '429',          430, 150,  8)
) as v(manufacturer, name, range_nm, speed_kts, seats)
  on m.name = v.manufacturer;
