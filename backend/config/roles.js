/**
 * roles.js — central role constants.
 *
 * A "creator" is any user who can own a course (create courses, schedule live
 * classes, take attendance, configure content). Teachers, schools, coaching
 * centers, and partners all qualify — they're all sellers/educators in the
 * platform's data model. Admin is included so platform staff can manage
 * anything.
 *
 * "Seller" roles overlap with creator roles but are tracked separately in case
 * we ever want to allow non-creator sellers (e.g. resellers).
 */
// Creator-tier roles can own courses + run classes. Now includes the new
// EduOS roadmap roles: corporate_trainer (sells to companies) and
// content_creator (individual edu influencer).
const CREATOR_ROLES = ['teacher', 'partner', 'school', 'coaching', 'admin', 'corporate_trainer', 'content_creator'];
const SELLER_ROLES  = ['teacher', 'partner', 'school', 'coaching', 'admin', 'corporate_trainer', 'content_creator'];
// Tenant-tier roles can administer an institution (school + coaching +
// franchise umbrellas + admin platform staff).
const INSTITUTION_ROLES = ['school', 'coaching', 'admin', 'franchise'];
const STUDENT_ROLES = ['student'];
const PARENT_ROLES  = ['parent'];
const ALL_ROLES = ['student','teacher','partner','school','coaching','admin','parent','corporate_trainer','content_creator','franchise'];

// Convenience groupings used by CMS and other route files
const ADMIN_ROLES      = ['admin', 'super_admin', 'platform_admin'];
const EDITOR_ROLES     = ['admin', 'super_admin', 'platform_admin', 'teacher', 'partner', 'org_admin'];
const TEACHER_ROLES    = ['teacher', 'mentor'];
const MANAGEMENT_ROLES = ['admin', 'super_admin', 'platform_admin', 'org_admin'];

module.exports = { CREATOR_ROLES, SELLER_ROLES, INSTITUTION_ROLES, STUDENT_ROLES, PARENT_ROLES, ALL_ROLES, ADMIN_ROLES, EDITOR_ROLES, TEACHER_ROLES, MANAGEMENT_ROLES };
