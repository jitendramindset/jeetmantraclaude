-- ============================================================================
-- Sprint 4 migration — Unified Booking Engine.
--
-- One engine for: sports ground / court / room / teacher / mentor / workshop /
-- event / equipment booking. Replaces ad-hoc per-vertical schemas.
--
-- Idempotent. Apply via /pg/query (same pattern as migration-s2-identity.sql).
-- Legacy `bookings` table left alone — Sprint 4 surfaces via `bookings_v2` so
-- existing course/service appointment data is undisturbed. A future Sprint
-- migrates legacy rows into the v2 engine as resource_type='course'.
-- ============================================================================

-- ── (S4-1) resources — anything that can be booked.
CREATE TABLE IF NOT EXISTS resources (
  id                varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type              varchar NOT NULL,
  owner_id          varchar NOT NULL,      -- the seller / provider
  institution_id    varchar,                -- optional tenant scope (Phase A)
  title             varchar NOT NULL,
  description       text,
  capacity          int     DEFAULT 1,      -- max attendees per slot
  price             numeric DEFAULT 0,
  currency          varchar DEFAULT 'INR',
  venue_name        varchar,
  venue_address     text,
  city              varchar,
  latitude          double precision,
  longitude         double precision,
  availability_json jsonb,                  -- recurring availability rules
  cover_image       text,
  is_active         boolean DEFAULT TRUE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_type_check;
ALTER TABLE resources ADD CONSTRAINT resources_type_check
  CHECK (type IN ('ground','court','room','teacher','mentor','workshop','event','course','equipment'));

CREATE INDEX IF NOT EXISTS idx_resources_type_active ON resources(type, is_active);
CREATE INDEX IF NOT EXISTS idx_resources_owner       ON resources(owner_id);
CREATE INDEX IF NOT EXISTS idx_resources_institution ON resources(institution_id);
CREATE INDEX IF NOT EXISTS idx_resources_city        ON resources(city);

-- ── (S4-2) bookings_v2 — the unified booking table. Named _v2 to avoid
-- clashing with the legacy course/service `bookings` table (schema.sql:126);
-- legacy rows are migrated by a future Sprint pass, not this one.
CREATE TABLE IF NOT EXISTS bookings_v2 (
  id             varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  resource_id    varchar NOT NULL,
  resource_type  varchar NOT NULL,        -- denormalized for fast filters
  booker_id      varchar NOT NULL,
  start_at       timestamptz NOT NULL,
  end_at         timestamptz NOT NULL,
  party_size     int     DEFAULT 1,
  amount         numeric DEFAULT 0,
  currency       varchar DEFAULT 'INR',
  payment_id     varchar,                  -- FK into payments when paid
  status         varchar DEFAULT 'pending',
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings_v2 DROP CONSTRAINT IF EXISTS bookings_v2_status_check;
ALTER TABLE bookings_v2 ADD CONSTRAINT bookings_v2_status_check
  CHECK (status IN ('pending','confirmed','cancelled','completed','no_show'));

ALTER TABLE bookings_v2 DROP CONSTRAINT IF EXISTS bookings_v2_window_check;
ALTER TABLE bookings_v2 ADD CONSTRAINT bookings_v2_window_check
  CHECK (end_at > start_at);

CREATE INDEX IF NOT EXISTS idx_bookings_v2_resource_time ON bookings_v2(resource_id, start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_booker_time   ON bookings_v2(booker_id, start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_status        ON bookings_v2(status);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_resource_type ON bookings_v2(resource_type, start_at);

NOTIFY pgrst, 'reload schema';
