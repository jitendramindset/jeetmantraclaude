-- ============================================================================
-- Sprint 11 (Phase D) — polish: UI i18n bundles + Smart Studio persistence.
--
-- EDUOS_GAP_ANALYSIS_V2 §5/§20 (UI string bundles, distinct from content
-- translations) and §8 (Studio had a full frontend but ZERO backend — nothing
-- persisted or published).
--
-- Additive + idempotent. Apply after migration-s10-verticals.sql.
-- ============================================================================

-- UI strings: app-shell labels, keyed by (key, lang). Distinct from
-- content_translations (which localizes user content, not chrome).
CREATE TABLE IF NOT EXISTS ui_strings (
  id         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key        varchar NOT NULL,
  lang       varchar NOT NULL,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ui_strings ON ui_strings(key, lang);

-- Studio scenes: persisted whiteboard/layout state so a creator can reload and
-- publish to a course (the §8 gap — studio was client-only).
CREATE TABLE IF NOT EXISTS studio_scenes (
  id         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id   varchar NOT NULL,
  title      varchar NOT NULL DEFAULT 'Untitled scene',
  data       jsonb NOT NULL,             -- elements, layout, settings
  thumbnail  text,                        -- data-url or storage path
  course_id  varchar,                     -- set when published to a course
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_studio_scenes_owner ON studio_scenes(owner_id);

NOTIFY pgrst, 'reload schema';
