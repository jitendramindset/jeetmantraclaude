-- ============================================================================
-- Sprint 6 migration — Certificates + Impersonation.
--   1. certificate_templates  — per-type cert HTML/CSS templates
--   2. certificates           — persisted issued certs with a public verify URL
--   3. impersonation_sessions — audit "view as user" support workflow
-- Idempotent. Apply via /pg/query.
-- ============================================================================

-- ── (S6.1) certificate_templates: catalog of cert designs. Each cert type can
-- have multiple versions; the latest active per (type, tenant_id) wins.
CREATE TABLE IF NOT EXISTS certificate_templates (
  id             varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type           varchar NOT NULL,   -- course_completion / workshop / attendance / skill / sports / participation
  title          varchar NOT NULL,
  tenant_id      varchar,             -- NULL = platform-wide default
  html_template  text,                -- {{name}} {{course}} {{date}} {{signature}} {{logo}} {{verify_url}}
  css_template   text,
  signature_url  text,
  logo_url       text,
  is_active      boolean DEFAULT TRUE,
  created_by     varchar,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cert_tpl_type_active  ON certificate_templates(type, is_active);
CREATE INDEX IF NOT EXISTS idx_cert_tpl_tenant       ON certificate_templates(tenant_id);

-- ── (S6.2) certificates: one row per issued cert. Verify token is a public
-- random string; verification endpoint is unauth (so a third-party employer
-- can verify a certificate URL without an account).
CREATE TABLE IF NOT EXISTS certificates (
  id            varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  serial        varchar NOT NULL UNIQUE,         -- human-readable, e.g. EDU-2026-A4F2C0
  verify_token  varchar NOT NULL UNIQUE,         -- random, used in the public verify URL
  type          varchar NOT NULL,
  template_id   varchar,                          -- nullable — falls back to default if cleared
  student_id    varchar NOT NULL,
  course_id     varchar,
  resource_id   varchar,                          -- bookings_v2-issued (Sprint 4 sports/workshop)
  tenant_id     varchar,
  title         varchar NOT NULL,
  issued_at     timestamptz NOT NULL DEFAULT now(),
  revoked_at    timestamptz,                      -- soft-revoke; never delete
  revoke_reason text,
  metadata      jsonb,                            -- snapshot of the holder name etc. at issue time
  pdf_url       text                              -- optional uploaded PDF rendition
);

ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_type_check;
ALTER TABLE certificates ADD CONSTRAINT certificates_type_check
  CHECK (type IN ('course_completion','workshop','attendance','skill','sports','participation'));

CREATE INDEX IF NOT EXISTS idx_certs_student_issued ON certificates(student_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_certs_course         ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certs_tenant         ON certificates(tenant_id);

-- Unique constraint: a student gets ONE non-revoked course_completion cert
-- per course. Re-issuing requires revoking the prior. Partial unique index
-- (only when not revoked).
CREATE UNIQUE INDEX IF NOT EXISTS uq_certs_one_active_per_course
  ON certificates(student_id, course_id, type)
  WHERE revoked_at IS NULL AND course_id IS NOT NULL;

-- ── (S6.3) impersonation_sessions: support audit primitive. Admin issues a
-- scoped JWT for another user; both the start and stop are audit-logged.
-- Active sessions have ended_at = NULL.
CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id           varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id     varchar NOT NULL,           -- the admin
  target_id    varchar NOT NULL,           -- the user being impersonated
  scope        varchar DEFAULT 'read',     -- 'read' or 'full'
  reason       text,                        -- support ticket / debugging reason
  actor_ip     varchar,
  user_agent   text,
  started_at   timestamptz NOT NULL DEFAULT now(),
  ended_at     timestamptz,
  expires_at   timestamptz                  -- hard cutoff on JWT exp
);

ALTER TABLE impersonation_sessions DROP CONSTRAINT IF EXISTS imp_sessions_scope_check;
ALTER TABLE impersonation_sessions ADD CONSTRAINT imp_sessions_scope_check
  CHECK (scope IN ('read','full'));

CREATE INDEX IF NOT EXISTS idx_imp_actor   ON impersonation_sessions(actor_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_imp_target  ON impersonation_sessions(target_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_imp_active  ON impersonation_sessions(ended_at) WHERE ended_at IS NULL;

NOTIFY pgrst, 'reload schema';
