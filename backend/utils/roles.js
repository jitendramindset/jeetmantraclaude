const ROLES = Object.freeze({
  STUDENT:   'student',
  TEACHER:   'teacher',
  ADMIN:     'admin',
  PARTNER:   'partner',
  PARENT:    'parent',
  INSTITUTE: 'institute',
});

const SELLER_ROLES = new Set([ROLES.TEACHER, ROLES.ADMIN, ROLES.PARTNER, ROLES.INSTITUTE]);
const ADMIN_ROLES  = new Set([ROLES.ADMIN]);
const ALL_ROLES    = new Set(Object.values(ROLES));

module.exports = { ROLES, SELLER_ROLES, ADMIN_ROLES, ALL_ROLES };
