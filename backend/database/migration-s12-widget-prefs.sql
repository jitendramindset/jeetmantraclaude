-- ============================================================================
-- Sprint 12 (W3) — per-user widget personalization.
--
-- EDUOS_WIDGET_UX_AUDIT §7: users add/remove/pin/reorder widgets. Admin config
-- already rides on organizations.settings.widgets (s9 settings jsonb). This adds
-- the per-user store the widget engine merges in resolution step 4.
--
-- Additive + idempotent. Apply after migration-s11-polish.sql.
-- ============================================================================

ALTER TABLE jeetmantra_users ADD COLUMN IF NOT EXISTS widget_prefs jsonb;
-- shape: { removed: ["id"], pinned: ["id"], order: ["id", ...] }

NOTIFY pgrst, 'reload schema';
