-- =============================================================================
-- AeroDesk — Expanded aircraft model list + new listing columns
-- Migration: 003_expanded_models.sql
-- Run this in Supabase SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- New manufacturers
-- ---------------------------------------------------------------------------

INSERT INTO manufacturers (name, country) VALUES
  ('Leonardo',  'Italy'),
  ('Sikorsky',  'United States')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- New columns on aircraft_listings
-- ---------------------------------------------------------------------------

ALTER TABLE aircraft_listings
  ADD COLUMN IF NOT EXISTS passenger_seats int,
  ADD COLUMN IF NOT EXISTS galley_config   text;

-- ---------------------------------------------------------------------------
-- Comprehensive aircraft model list
-- Uses ON CONFLICT DO NOTHING to safely add alongside existing rows
-- ---------------------------------------------------------------------------

INSERT INTO aircraft_models (manufacturer_id, name, category)
SELECT m.id, v.name, v.cat::aircraft_category
FROM manufacturers m
JOIN (VALUES

  -- ── Cessna — Jets ─────────────────────────────────────────────────────────
  ('Cessna', 'Citation Mustang',         'jet'),
  ('Cessna', 'Citation M2',              'jet'),
  ('Cessna', 'Citation M2 Gen2',         'jet'),
  ('Cessna', 'Citation CJ1',             'jet'),
  ('Cessna', 'Citation CJ1+',            'jet'),
  ('Cessna', 'Citation CJ2',             'jet'),
  ('Cessna', 'Citation CJ2+',            'jet'),
  ('Cessna', 'Citation CJ3',             'jet'),
  ('Cessna', 'Citation CJ3+',            'jet'),
  ('Cessna', 'Citation CJ4',             'jet'),
  ('Cessna', 'Citation Bravo',           'jet'),
  ('Cessna', 'Citation Encore',          'jet'),
  ('Cessna', 'Citation Encore+',         'jet'),
  ('Cessna', 'Citation V',               'jet'),
  ('Cessna', 'Citation Ultra',           'jet'),
  ('Cessna', 'Citation Excel',           'jet'),
  ('Cessna', 'Citation XLS',             'jet'),
  ('Cessna', 'Citation XLS+',            'jet'),
  ('Cessna', 'Citation Sovereign',       'jet'),
  ('Cessna', 'Citation Sovereign+',      'jet'),
  ('Cessna', 'Citation Latitude',        'jet'),
  ('Cessna', 'Citation Longitude',       'jet'),
  ('Cessna', 'Citation X',               'jet'),
  ('Cessna', 'Citation X+',              'jet'),

  -- ── Cessna — Turboprops ───────────────────────────────────────────────────
  ('Cessna', 'Caravan',                  'turboprop'),
  ('Cessna', 'Grand Caravan',            'turboprop'),
  ('Cessna', 'Grand Caravan EX',         'turboprop'),
  ('Cessna', 'Conquest I',               'turboprop'),
  ('Cessna', 'Conquest II',              'turboprop'),
  ('Cessna', 'Denali',                   'turboprop'),

  -- ── Cessna — Pistons ──────────────────────────────────────────────────────
  ('Cessna', '172 Skyhawk',              'piston'),
  ('Cessna', '182 Skylane',              'piston'),
  ('Cessna', '206 Stationair',           'piston'),
  ('Cessna', 'T206H Turbo Stationair',   'piston'),
  ('Cessna', '210 Centurion',            'piston'),
  ('Cessna', 'TTx (T240)',               'piston'),

  -- ── Embraer — Jets ────────────────────────────────────────────────────────
  ('Embraer', 'Phenom 100',              'jet'),
  ('Embraer', 'Phenom 100E',             'jet'),
  ('Embraer', 'Phenom 100EV',            'jet'),
  ('Embraer', 'Phenom 300',              'jet'),
  ('Embraer', 'Phenom 300E',             'jet'),
  ('Embraer', 'Praetor 500',             'jet'),
  ('Embraer', 'Praetor 600',             'jet'),
  ('Embraer', 'Legacy 450',              'jet'),
  ('Embraer', 'Legacy 500',              'jet'),
  ('Embraer', 'Legacy 600',              'jet'),
  ('Embraer', 'Legacy 650',              'jet'),
  ('Embraer', 'Legacy 650E',             'jet'),
  ('Embraer', 'Lineage 1000',            'jet'),
  ('Embraer', 'Lineage 1000E',           'jet'),

  -- ── Embraer — Turboprops ──────────────────────────────────────────────────
  ('Embraer', 'EMB 120 Brasilia',        'turboprop'),

  -- ── Bombardier — Jets ─────────────────────────────────────────────────────
  ('Bombardier', 'Learjet 40',           'jet'),
  ('Bombardier', 'Learjet 45',           'jet'),
  ('Bombardier', 'Learjet 45XR',         'jet'),
  ('Bombardier', 'Learjet 60',           'jet'),
  ('Bombardier', 'Learjet 60XR',         'jet'),
  ('Bombardier', 'Learjet 70',           'jet'),
  ('Bombardier', 'Learjet 75',           'jet'),
  ('Bombardier', 'Challenger 300',       'jet'),
  ('Bombardier', 'Challenger 350',       'jet'),
  ('Bombardier', 'Challenger 604',       'jet'),
  ('Bombardier', 'Challenger 605',       'jet'),
  ('Bombardier', 'Challenger 650',       'jet'),
  ('Bombardier', 'Global 5000',          'jet'),
  ('Bombardier', 'Global 5500',          'jet'),
  ('Bombardier', 'Global 6000',          'jet'),
  ('Bombardier', 'Global 6500',          'jet'),
  ('Bombardier', 'Global 7500',          'jet'),
  ('Bombardier', 'Global 8000',          'jet'),
  ('Bombardier', 'Global Express',       'jet'),
  ('Bombardier', 'Global Express XRS',   'jet'),

  -- ── Gulfstream — Jets ─────────────────────────────────────────────────────
  ('Gulfstream', 'G150',                 'jet'),
  ('Gulfstream', 'G200',                 'jet'),
  ('Gulfstream', 'G280',                 'jet'),
  ('Gulfstream', 'G400',                 'jet'),
  ('Gulfstream', 'G450',                 'jet'),
  ('Gulfstream', 'G500',                 'jet'),
  ('Gulfstream', 'G550',                 'jet'),
  ('Gulfstream', 'G600',                 'jet'),
  ('Gulfstream', 'G650',                 'jet'),
  ('Gulfstream', 'G650ER',               'jet'),
  ('Gulfstream', 'G700',                 'jet'),
  ('Gulfstream', 'G800',                 'jet'),
  ('Gulfstream', 'GIV-SP',               'jet'),
  ('Gulfstream', 'GV',                   'jet'),

  -- ── Beechcraft — Jets (Hawker series) ─────────────────────────────────────
  ('Beechcraft', 'Premier I',            'jet'),
  ('Beechcraft', 'Premier IA',           'jet'),
  ('Beechcraft', 'Hawker 400XP',         'jet'),
  ('Beechcraft', 'Hawker 750',           'jet'),
  ('Beechcraft', 'Hawker 800XP',         'jet'),
  ('Beechcraft', 'Hawker 850XP',         'jet'),
  ('Beechcraft', 'Hawker 900XP',         'jet'),
  ('Beechcraft', 'Hawker 4000',          'jet'),

  -- ── Beechcraft — Turboprops ───────────────────────────────────────────────
  ('Beechcraft', 'King Air 90',          'turboprop'),
  ('Beechcraft', 'King Air 90GTx',       'turboprop'),
  ('Beechcraft', 'King Air 200',         'turboprop'),
  ('Beechcraft', 'King Air 250',         'turboprop'),
  ('Beechcraft', 'King Air 260',         'turboprop'),
  ('Beechcraft', 'King Air 300',         'turboprop'),
  ('Beechcraft', 'King Air 350',         'turboprop'),
  ('Beechcraft', 'King Air 350i',        'turboprop'),
  ('Beechcraft', 'King Air 360',         'turboprop'),
  ('Beechcraft', 'King Air 360ER',       'turboprop'),

  -- ── Beechcraft — Pistons ──────────────────────────────────────────────────
  ('Beechcraft', 'Bonanza A36',          'piston'),
  ('Beechcraft', 'Bonanza G36',          'piston'),
  ('Beechcraft', 'Baron 58',             'piston'),
  ('Beechcraft', 'Baron G58',            'piston'),

  -- ── Dassault — Jets ───────────────────────────────────────────────────────
  ('Dassault', 'Falcon 50',              'jet'),
  ('Dassault', 'Falcon 50EX',            'jet'),
  ('Dassault', 'Falcon 900',             'jet'),
  ('Dassault', 'Falcon 900EX',           'jet'),
  ('Dassault', 'Falcon 900LX',           'jet'),
  ('Dassault', 'Falcon 900DX',           'jet'),
  ('Dassault', 'Falcon 2000',            'jet'),
  ('Dassault', 'Falcon 2000EX',          'jet'),
  ('Dassault', 'Falcon 2000LX',          'jet'),
  ('Dassault', 'Falcon 2000LXS',         'jet'),
  ('Dassault', 'Falcon 2000S',           'jet'),
  ('Dassault', 'Falcon 7X',              'jet'),
  ('Dassault', 'Falcon 8X',              'jet'),
  ('Dassault', 'Falcon 6X',              'jet'),
  ('Dassault', 'Falcon 10X',             'jet'),

  -- ── Pilatus — Turboprops ──────────────────────────────────────────────────
  ('Pilatus', 'PC-12',                   'turboprop'),
  ('Pilatus', 'PC-12 NG',                'turboprop'),
  ('Pilatus', 'PC-12 NGX',               'turboprop'),

  -- ── Pilatus — Jets ────────────────────────────────────────────────────────
  ('Pilatus', 'PC-24',                   'jet'),

  -- ── Piper — Pistons ───────────────────────────────────────────────────────
  ('Piper', 'Archer III',                'piston'),
  ('Piper', 'Archer LX',                 'piston'),
  ('Piper', 'Archer TX',                 'piston'),
  ('Piper', 'Warrior III',               'piston'),
  ('Piper', 'Seneca V',                  'piston'),
  ('Piper', 'Malibu',                    'piston'),
  ('Piper', 'Malibu Mirage',             'piston'),
  ('Piper', 'M350',                      'piston'),

  -- ── Piper — Turboprops ────────────────────────────────────────────────────
  ('Piper', 'Cheyenne',                  'turboprop'),
  ('Piper', 'Meridian',                  'turboprop'),
  ('Piper', 'M500',                      'turboprop'),
  ('Piper', 'M600',                      'turboprop'),
  ('Piper', 'M600/SLS',                  'turboprop'),
  ('Piper', 'M700 Fury',                 'turboprop'),

  -- ── Cirrus — Pistons ──────────────────────────────────────────────────────
  ('Cirrus', 'SR20',                     'piston'),
  ('Cirrus', 'SR22',                     'piston'),
  ('Cirrus', 'SR22T',                    'piston'),
  ('Cirrus', 'SR22T G6',                 'piston'),
  ('Cirrus', 'SR22T G7',                 'piston'),

  -- ── Cirrus — Jets ─────────────────────────────────────────────────────────
  ('Cirrus', 'SF50 Vision Jet',          'jet'),
  ('Cirrus', 'SF50 G2',                  'jet'),
  ('Cirrus', 'SF50 G2+',                 'jet'),

  -- ── Daher — Turboprops ────────────────────────────────────────────────────
  ('Daher', 'TBM 700',                   'turboprop'),
  ('Daher', 'TBM 850',                   'turboprop'),
  ('Daher', 'TBM 900',                   'turboprop'),
  ('Daher', 'TBM 910',                   'turboprop'),
  ('Daher', 'TBM 930',                   'turboprop'),
  ('Daher', 'TBM 940',                   'turboprop'),
  ('Daher', 'TBM 960',                   'turboprop'),
  ('Daher', 'Kodiak 100',                'turboprop'),
  ('Daher', 'Kodiak 900',                'turboprop'),

  -- ── Robinson — Helicopters ────────────────────────────────────────────────
  ('Robinson', 'R22',                    'helicopter'),
  ('Robinson', 'R22 Beta II',            'helicopter'),
  ('Robinson', 'R44 Raven I',            'helicopter'),
  ('Robinson', 'R44 Raven II',           'helicopter'),
  ('Robinson', 'R44 Cadet',              'helicopter'),
  ('Robinson', 'R66 Turbine',            'helicopter'),

  -- ── Airbus Helicopters ────────────────────────────────────────────────────
  ('Airbus Helicopters', 'H120 (EC120)', 'helicopter'),
  ('Airbus Helicopters', 'H125',         'helicopter'),
  ('Airbus Helicopters', 'H125 (AS350)', 'helicopter'),
  ('Airbus Helicopters', 'H130 (EC130)', 'helicopter'),
  ('Airbus Helicopters', 'H135 (EC135)', 'helicopter'),
  ('Airbus Helicopters', 'H145',         'helicopter'),
  ('Airbus Helicopters', 'H145 (EC145)', 'helicopter'),
  ('Airbus Helicopters', 'H155 (EC155)', 'helicopter'),
  ('Airbus Helicopters', 'H160',         'helicopter'),
  ('Airbus Helicopters', 'H175',         'helicopter'),
  ('Airbus Helicopters', 'H215 (AS332)', 'helicopter'),
  ('Airbus Helicopters', 'H225 (EC225)', 'helicopter'),

  -- ── Bell — Helicopters ────────────────────────────────────────────────────
  ('Bell', 'Bell 206B',                  'helicopter'),
  ('Bell', 'Bell 206L',                  'helicopter'),
  ('Bell', 'Bell 407',                   'helicopter'),
  ('Bell', 'Bell 407GXi',                'helicopter'),
  ('Bell', 'Bell 412',                   'helicopter'),
  ('Bell', 'Bell 429',                   'helicopter'),
  ('Bell', 'Bell 505',                   'helicopter'),
  ('Bell', 'Bell 525',                   'helicopter'),

  -- ── Leonardo — Helicopters ────────────────────────────────────────────────
  ('Leonardo', 'AW109',                  'helicopter'),
  ('Leonardo', 'AW109S',                 'helicopter'),
  ('Leonardo', 'AW119',                  'helicopter'),
  ('Leonardo', 'AW139',                  'helicopter'),
  ('Leonardo', 'AW169',                  'helicopter'),
  ('Leonardo', 'AW189',                  'helicopter'),

  -- ── Sikorsky — Helicopters ────────────────────────────────────────────────
  ('Sikorsky', 'S-76C++',               'helicopter'),
  ('Sikorsky', 'S-76D',                  'helicopter'),
  ('Sikorsky', 'S-92',                   'helicopter')

) AS v(mfr, name, cat) ON m.name = v.mfr
ON CONFLICT ON CONSTRAINT aircraft_models_unique DO NOTHING;
