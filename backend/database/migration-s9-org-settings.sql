-- ============================================================================
-- Sprint 9 (Phase A) — org settings + active-context spine.
--
-- The gap analysis (EDUOS_GAP_ANALYSIS_V2.md §0 D1, §1, §2) calls for
-- `organizations` to become the single tenant root with settings (plan, status,
-- domain, default locale, SEO) and for users to remember their last-active org
-- so the context switcher can re-scope the session.
--
-- Additive + idempotent. Apply after migration-s8-permission-tiers.sql.
-- ============================================================================

-- Org settings columns (jsonb seo kept open-ended for Phase B SEO work).
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan            varchar DEFAULT 'free';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status          varchar DEFAULT 'active';   -- active | suspended
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slug            varchar;                    -- public/SEO slug
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain          varchar;                    -- custom domain / subdomain
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS locale_default  varchar DEFAULT 'en';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS allowed_locales jsonb;                      -- ["en","hi",...]
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS seo             jsonb;                      -- { meta_description, og_image, keywords }
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings        jsonb;                      -- misc per-org config

CREATE UNIQUE INDEX IF NOT EXISTS uq_orgs_slug ON organizations(slug) WHERE slug IS NOT NULL;

-- Remember the caller's active org so the switcher restores it next session.
ALTER TABLE jeetmantra_users ADD COLUMN IF NOT EXISTS last_active_org_id varchar;

NOTIFY pgrst, 'reload schema';
