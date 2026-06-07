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
const CREATOR_ROLES = ['teacher', 'partner', 'school', 'coaching', 'admin'];
const SELLER_ROLES  = ['teacher', 'partner', 'school', 'coaching', 'admin'];
const INSTITUTION_ROLES = ['school', 'coaching', 'admin'];
const STUDENT_ROLES = ['student'];

module.exports = { CREATOR_ROLES, SELLER_ROLES, INSTITUTION_ROLES, STUDENT_ROLES };
