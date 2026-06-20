-- ============================================================================
-- Sprint 8 migration — the 3 missing permission tiers from the 9-level model.
--
-- The role-org reality-check found the 9-level permission model (Org Owner /
-- Org Admin / Teacher / Assistant Teacher / Coach / Trainer / Student / Parent
-- / Viewer) was only ~4 levels deep. Coach & Trainer are full-creator tiers
-- (same caps as Teacher, distinguished by org category, not capability). The
-- three genuinely-distinct tiers that were missing capability bundles:
--
--   org_admin         — manages an org's members + branding + sees money/analytics
--   assistant_teacher — helps teach (attendance, grading, roster) but can't
--                        create/delete courses or touch billing
--   viewer            — read-only observer (analytics + dashboards)
--
-- These are ORG-SCOPED roles used in role_assignments — they are NOT
-- jeetmantra_users.user_type values (no CHECK change). role_capabilities keys
-- on the role string, so we just seed grants.
--
-- Idempotent. Apply after migration-s7-role-org.sql.
-- ============================================================================

INSERT INTO role_capabilities (role, capability_key) VALUES
  -- org_admin: org management + visibility, no course ownership.
  ('org_admin','org.member.invite'),
  ('org_admin','org.member.manage'),
  ('org_admin','org.branding'),
  ('org_admin','analytics.read'),
  ('org_admin','student.manage'),
  ('org_admin','payment.read'),
  ('org_admin','certificate.issue'),

  -- assistant_teacher: teach-assist, no create/delete/billing.
  ('assistant_teacher','attendance.mark'),
  ('assistant_teacher','assignment.grade'),
  ('assistant_teacher','student.manage'),
  ('assistant_teacher','live.start'),

  -- viewer: read-only.
  ('viewer','analytics.read')
ON CONFLICT DO NOTHING;

-- ── New capabilities for the cutover batch 3 (eduos + creator authoring).
-- These give the remaining authorizeRole() routes a semantically-correct
-- capability to gate on, at parity with today's role-sets.
INSERT INTO capabilities (key, description, category) VALUES
  ('admissions.manage', 'Manage admissions / enrollment intake', 'org'),
  ('billing.manage',    'Manage fee plans / invoices / reminders', 'commerce'),
  ('payroll.manage',    'Manage staff payroll',                'commerce'),
  ('hr.manage',         'Approve leave / HR decisions',         'org'),
  ('assignment.manage', 'Create / edit assignments',           'teaching'),
  ('invoice.manage',    'Issue / edit invoices to students',    'commerce')
ON CONFLICT (key) DO NOTHING;

-- Institution-tier (school/coaching/franchise) + org_admin get the org ops.
INSERT INTO role_capabilities (role, capability_key)
SELECT r, c FROM (VALUES ('school'),('coaching'),('franchise'),('org_admin')) AS roles(r)
CROSS JOIN (VALUES
  ('admissions.manage'),('billing.manage'),('payroll.manage'),('hr.manage')
) AS caps(c)
ON CONFLICT DO NOTHING;

-- Creator-tier get the authoring + invoicing caps.
INSERT INTO role_capabilities (role, capability_key)
SELECT r, c FROM (VALUES
  ('teacher'),('partner'),('coaching'),('school'),('corporate_trainer'),('content_creator'),('franchise')
) AS roles(r)
CROSS JOIN (VALUES ('assignment.manage'),('invoice.manage')) AS caps(c)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
