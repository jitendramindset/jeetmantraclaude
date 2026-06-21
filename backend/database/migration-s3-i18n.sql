-- ============================================================================
-- Sprint 3 migration — Localization depth.
--
-- Persisted, entity-scoped translation cache. Where /api/ai/translate caches
-- arbitrary UI strings in LevelDB by hash, this layer pins translations to a
-- specific (entity_type, entity_id, field) so:
--   • Sprint 5 admin can show a per-entity "needs translation" queue,
--   • bulk re-translation can target one entity_type at a time,
--   • human edits ('generated_by' = 'human') can override AI output durably,
--   • we know when a source has changed (source_hash mismatch) and the
--     translation is stale.
--
-- Idempotent — every statement guards with IF NOT EXISTS / DROP-then-ADD.
-- Apply via Supabase /pg/query (DO NOT run raw SQL — see project conventions).
-- ============================================================================

-- ── (S3-1) content_translations — one row per (entity, field, target language).
CREATE TABLE IF NOT EXISTS content_translations (
  id            varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  entity_type   varchar NOT NULL,
  entity_id     varchar NOT NULL,
  field         varchar NOT NULL,
  source_lang   varchar NOT NULL DEFAULT 'en',
  target_lang   varchar NOT NULL,
  source_hash   varchar NOT NULL,
  text          text    NOT NULL,
  generated_by  varchar,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_translations_entity_type_check
    CHECK (entity_type IN (
      'course','topic','lecture','material','test','question',
      'assignment','certificate','notification','message'
    )),
  CONSTRAINT content_translations_generated_by_check
    CHECK (generated_by IS NULL OR generated_by IN ('ai','human'))
);

-- One translation per (entity, field, target_lang).
CREATE UNIQUE INDEX IF NOT EXISTS uq_content_translations_entity_field_lang
  ON content_translations(entity_type, entity_id, field, target_lang);

CREATE INDEX IF NOT EXISTS idx_content_translations_entity
  ON content_translations(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_content_translations_target_lang
  ON content_translations(target_lang);

-- Tell PostgREST to reload its schema cache after these structural changes.
NOTIFY pgrst, 'reload schema';
