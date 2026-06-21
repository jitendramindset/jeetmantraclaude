-- ============================================================================
-- Sprint 10 (Phase C) — vertical enablers: timetable + recurring booking slots.
--
-- EDUOS_GAP_ANALYSIS_V2 §9 (Timetable, P0 for Schools) and §17 (Sports/Court
-- booking, P0 for Sports/Yoga/Dance). courses.class_mode already covers
-- online/offline/hybrid, so no course change is needed.
--
-- Additive + idempotent. Apply after migration-s9-org-settings.sql.
-- ============================================================================

-- ── Timetable (Schools / Coaching): weekly templates → generated slots.
CREATE TABLE IF NOT EXISTS timetable_templates (
  id         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id     varchar NOT NULL,
  name       varchar NOT NULL,                 -- "Class 9 — Section A weekly"
  course_id  varchar,                          -- optional: bind to a course/batch
  batch_id   varchar,
  created_by varchar,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tt_templates_org ON timetable_templates(org_id);

CREATE TABLE IF NOT EXISTS timetable_slots (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  template_id varchar NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  varchar NOT NULL,                -- 'HH:MM' local
  end_time    varchar NOT NULL,
  subject     varchar,
  teacher_id  varchar,
  room        varchar,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tt_slots_template ON timetable_slots(template_id);

-- ── Recurring booking slots (Sports / Yoga / Dance / Music): a resource's
-- repeating availability windows, from which concrete bookings are made.
CREATE TABLE IF NOT EXISTS resource_slots (
  id           varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  resource_id  varchar NOT NULL,
  day_of_week  int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   varchar NOT NULL,               -- 'HH:MM'
  end_time     varchar NOT NULL,
  capacity     int DEFAULT 1,
  price        numeric,
  coach_id     varchar,                         -- optional assigned coach/instructor
  is_active    boolean DEFAULT TRUE,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resource_slots_resource ON resource_slots(resource_id);

-- ── Batch lifecycle (Coaching / Sports cohorts): status + capacity.
ALTER TABLE batches ADD COLUMN IF NOT EXISTS status   varchar DEFAULT 'upcoming'; -- upcoming|running|completed|cancelled
ALTER TABLE batches ADD COLUMN IF NOT EXISTS capacity int;

NOTIFY pgrst, 'reload schema';
