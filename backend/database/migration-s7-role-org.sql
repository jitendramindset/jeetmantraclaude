-- ============================================================================
-- Sprint 7 migration — Role + Organization unification FOUNDATION.
--
-- This is the ADDITIVE foundation from EDUOS_ROLE_ORG_UNIFICATION.md §3-5.
-- It does NOT rip out the existing user_type / authorizeRole flow — that's a
-- later, riskier step. Instead it lays the five-axis model alongside the
-- current system so new code can opt in via requireCapability(), exactly how
-- Sprint 1 added user_roles alongside user_type.
--
--   organizations      — orgs decoupled from the user row
--   role_assignments   — person × org × role × scope
--   capabilities       — string permission catalog
--   role_capabilities  — which role grants which capability
--   course_categories  — Education / Sports / Fitness / Arts / Skills
--   course_subcategories
--
-- Idempotent. Apply via /pg/query.
-- ============================================================================

-- ── (S7.1) organizations. Seed id = the existing institution user id so every
-- existing courses.institution_id FK keeps pointing at a valid row.
CREATE TABLE IF NOT EXISTS organizations (
  id           varchar PRIMARY KEY,          -- = jeetmantra_users.id for legacy orgs
  owner_id     varchar NOT NULL,             -- the person who owns it
  name         varchar NOT NULL,
  type         varchar NOT NULL DEFAULT 'custom',
  category     varchar,                       -- primary category slug
  is_personal  boolean DEFAULT FALSE,         -- personal academy vs public org
  branding     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_type_check
  CHECK (type IN (
    'school','coaching','sports_academy','yoga_center','dance_academy',
    'music_academy','reading_club','training_institute','home_tuition',
    'language_center','corporate_training','skill_center','ngo','community','custom'
  ));

CREATE INDEX IF NOT EXISTS idx_orgs_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_orgs_type  ON organizations(type);

-- Backfill: every institution-type user becomes an organization row, plus
-- every auto-provisioned personal institute (institution_teachers self-row).
INSERT INTO organizations (id, owner_id, name, type, is_personal)
SELECT u.id, u.id, COALESCE(u.full_name, 'Organization'),
  CASE WHEN u.user_type IN ('school','coaching','franchise') THEN u.user_type ELSE 'custom' END,
  CASE WHEN u.user_type IN ('school','coaching','franchise') THEN FALSE ELSE TRUE END
FROM jeetmantra_users u
WHERE u.user_type IN ('school','coaching','franchise','teacher','partner','corporate_trainer','content_creator')
ON CONFLICT (id) DO NOTHING;

-- ── (S7.2) role_assignments. person × org × role × scope. Backfilled from
-- user_roles (Sprint 1) + institution_teachers/students.
CREATE TABLE IF NOT EXISTS role_assignments (
  id          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  person_id   varchar NOT NULL,
  org_id      varchar,                        -- NULL = platform-wide role
  role        varchar NOT NULL,
  scope       varchar DEFAULT 'org',          -- 'platform' | 'org'
  granted_by  varchar,
  granted_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_role_assignment
  ON role_assignments(person_id, COALESCE(org_id, ''), role) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ra_person ON role_assignments(person_id);
CREATE INDEX IF NOT EXISTS idx_ra_org    ON role_assignments(org_id);

-- Backfill platform-wide roles from user_roles.
INSERT INTO role_assignments (person_id, org_id, role, scope)
SELECT user_id, NULL, role, 'platform' FROM user_roles
ON CONFLICT DO NOTHING;

-- Backfill org-scoped teacher memberships.
INSERT INTO role_assignments (person_id, org_id, role, scope)
SELECT teacher_id, institution_id, 'teacher', 'org' FROM institution_teachers
WHERE is_active IS NOT FALSE
ON CONFLICT DO NOTHING;

-- ── (S7.3) capabilities + role_capabilities. The permission system.
CREATE TABLE IF NOT EXISTS capabilities (
  key          varchar PRIMARY KEY,
  description  text,
  category     varchar
);

CREATE TABLE IF NOT EXISTS role_capabilities (
  role            varchar NOT NULL,
  capability_key  varchar NOT NULL,
  PRIMARY KEY (role, capability_key)
);

-- Seed the capability catalog.
INSERT INTO capabilities (key, description, category) VALUES
  ('course.create',    'Create courses / programs',          'content'),
  ('course.edit',      'Edit owned courses',                 'content'),
  ('course.delete',    'Delete owned courses',               'content'),
  ('live.schedule',    'Schedule live classes',              'teaching'),
  ('live.start',       'Start / run live classes',           'teaching'),
  ('attendance.mark',  'Mark attendance',                    'teaching'),
  ('assignment.grade', 'Grade assignments / essays',         'teaching'),
  ('test.create',      'Create tests',                       'teaching'),
  ('certificate.issue','Issue certificates',                 'teaching'),
  ('student.manage',   'Manage students / roster',           'teaching'),
  ('booking.manage',   'Manage bookable resources',          'commerce'),
  ('payment.read',     'View payments / revenue',            'commerce'),
  ('payout.request',   'Request payouts',                    'commerce'),
  ('org.member.invite','Invite org members',                 'org'),
  ('org.member.manage','Change member roles',                'org'),
  ('org.branding',     'Edit org branding',                  'org'),
  ('org.transfer',     'Transfer org ownership',             'org'),
  ('analytics.read',   'View analytics',                     'org'),
  ('admin.users',      'Manage platform users',              'platform'),
  ('admin.impersonate','Impersonate users',                  'platform'),
  ('admin.moderate',   'Moderate content',                   'platform'),
  ('admin.settings',   'Edit platform settings',             'platform')
ON CONFLICT (key) DO NOTHING;

-- Seed role → capability grants (mirrors today's CREATOR / INSTITUTION / admin
-- role-set behaviour so requireCapability() is at parity on day 1).
-- creator-tier (teacher/partner/coaching/school/corporate_trainer/content_creator):
INSERT INTO role_capabilities (role, capability_key)
SELECT r, c FROM (VALUES
  ('teacher'),('partner'),('coaching'),('school'),('corporate_trainer'),('content_creator')
) AS roles(r)
CROSS JOIN (VALUES
  ('course.create'),('course.edit'),('course.delete'),('live.schedule'),('live.start'),
  ('attendance.mark'),('assignment.grade'),('test.create'),('certificate.issue'),
  ('student.manage'),('booking.manage'),('payment.read'),('payout.request'),('analytics.read')
) AS caps(c)
ON CONFLICT DO NOTHING;

-- institution-tier extra grants (school/coaching/franchise):
INSERT INTO role_capabilities (role, capability_key)
SELECT r, c FROM (VALUES ('school'),('coaching'),('franchise')) AS roles(r)
CROSS JOIN (VALUES
  ('org.member.invite'),('org.member.manage'),('org.branding'),('analytics.read')
) AS caps(c)
ON CONFLICT DO NOTHING;

-- admin = everything.
INSERT INTO role_capabilities (role, capability_key)
SELECT 'admin', key FROM capabilities
ON CONFLICT DO NOTHING;

-- ── (S7.4) categories taxonomy. Replaces free-text courses.category.
CREATE TABLE IF NOT EXISTS course_categories (
  id      varchar PRIMARY KEY,        -- slug
  name    varchar NOT NULL,
  icon    varchar,
  sort    int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS course_subcategories (
  id           varchar PRIMARY KEY,   -- slug
  category_id  varchar NOT NULL,
  name         varchar NOT NULL,
  sort         int DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_subcat_cat ON course_subcategories(category_id);

INSERT INTO course_categories (id, name, icon, sort) VALUES
  ('education','Education','📚',1),
  ('sports','Sports','🏏',2),
  ('fitness','Fitness','🧘',3),
  ('arts','Arts','🎨',4),
  ('skills','Skills','💻',5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_subcategories (id, category_id, name, sort) VALUES
  ('mathematics','education','Mathematics',1),
  ('science','education','Science',2),
  ('english','education','English',3),
  ('cricket','sports','Cricket',1),
  ('football','sports','Football',2),
  ('tennis','sports','Tennis',3),
  ('yoga','fitness','Yoga',1),
  ('meditation','fitness','Meditation',2),
  ('gym','fitness','Gym',3),
  ('dance','arts','Dance',1),
  ('music','arts','Music',2),
  ('painting','arts','Painting',3),
  ('coding','skills','Coding',1),
  ('ai','skills','AI',2),
  ('sap','skills','SAP',3)
ON CONFLICT (id) DO NOTHING;

-- Add nullable category/subcategory FKs to courses (free-text `category`
-- column stays for back-compat; new code reads category_id).
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_id    varchar;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subcategory_id varchar;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS program_type   varchar;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS session_type   varchar;

NOTIFY pgrst, 'reload schema';
