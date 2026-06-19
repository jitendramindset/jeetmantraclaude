-- ============================================================================
-- Sprint 2 migration — Identity foundation + ad-hoc DDL capture.
--
-- Idempotent: every statement guards with IF NOT EXISTS / DROP-then-ADD.
-- Apply via:  node backend/scripts/run-migration-s2.js
-- Or directly through Supabase /pg/query.
-- ============================================================================

-- ── (S2-1) user_type CHECK constraint: add corporate_trainer, content_creator,
-- franchise, parent. Previously inserts of those roles silently failed.
-- Mirror of roles.js ALL_ROLES.
ALTER TABLE jeetmantra_users
  DROP CONSTRAINT IF EXISTS jeetmantra_users_user_type_check;

ALTER TABLE jeetmantra_users
  ADD CONSTRAINT jeetmantra_users_user_type_check
  CHECK (user_type IN (
    'student', 'teacher', 'partner', 'admin', 'school', 'coaching',
    'parent', 'corporate_trainer', 'content_creator', 'franchise'
  ));

-- ── (S2-3) Capture ad-hoc DDL applied during prior sessions, so the schema is
-- reproducible from the repo. Idempotent — running this against a DB that
-- already has the columns is a no-op.
ALTER TABLE chat_room_members
  ADD COLUMN IF NOT EXISTS last_read_at timestamptz;

-- courses.institution_id already exists in the live DB (varchar) but isn't in
-- any committed SQL — add it idempotently in case of a fresh install.
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS institution_id varchar;

CREATE INDEX IF NOT EXISTS idx_courses_institution_id
  ON courses(institution_id);

-- ── (S2-4) user_roles — multi-role mapping. A user can now hold ≥ 1 role
-- (e.g. teacher + parent + student) globally OR scoped to a specific
-- institution. user_type stays as the PRIMARY/display role for back-compat;
-- this table is the authoritative source for permission checks.
--
-- institution_id NULL = a platform-wide role (the user is a teacher / parent
-- everywhere). institution_id set = the role is granted only within that org
-- (e.g. user X is an admin only within institution Y).
--
-- Uses varchar for ids (matches jeetmantra_users.id VARCHAR quirk — no UUID
-- FK embeds possible, see [[supabase-selfhosted-quirks]]).
CREATE TABLE IF NOT EXISTS user_roles (
  id             varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id        varchar NOT NULL,
  role           varchar NOT NULL,
  institution_id varchar,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_role_check
    CHECK (role IN (
      'student', 'teacher', 'partner', 'admin', 'school', 'coaching',
      'parent', 'corporate_trainer', 'content_creator', 'franchise'
    ))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_roles_user_role_inst
  ON user_roles(user_id, role, COALESCE(institution_id, ''));

CREATE INDEX IF NOT EXISTS idx_user_roles_user
  ON user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_institution
  ON user_roles(institution_id);

-- Backfill: every existing user gets their user_type as a platform-wide role,
-- so authorizeRole(union) is at parity with authorizeRole(single) on day 1.
INSERT INTO user_roles (user_id, role, institution_id)
SELECT id, user_type, NULL
FROM jeetmantra_users
WHERE user_type IS NOT NULL
ON CONFLICT DO NOTHING;

-- ── (S2-6) Personal-institute auto-provisioning. Every teacher (or other
-- creator role) is added to institution_teachers with institution_id = their
-- own user id. They become a member of themselves, so resolveInstitution
-- accepts X-Active-Institution: <self> and every course they create can be
-- tagged with institution_id = self — killing the institution_id-null path
-- Phase A had to work around.
--
-- New teacher signups get this row inserted in routes/auth.js. This backfill
-- handles existing teachers.
INSERT INTO institution_teachers (id, institution_id, teacher_id, subject, is_active)
SELECT
  gen_random_uuid()::text,
  u.id, u.id,
  'Personal Workspace',
  TRUE
FROM jeetmantra_users u
WHERE u.user_type IN ('teacher', 'partner', 'school', 'coaching', 'corporate_trainer', 'content_creator')
  AND NOT EXISTS (
    SELECT 1 FROM institution_teachers it
    WHERE it.institution_id = u.id AND it.teacher_id = u.id
  );

-- Tell PostgREST to reload its schema cache after these structural changes.
NOTIFY pgrst, 'reload schema';
