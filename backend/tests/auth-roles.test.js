'use strict';
const { rolesOf, authorizeRole } = require('../middleware/auth');

describe('rolesOf', () => {
  test('single-role (legacy) JWT', () => {
    const set = rolesOf({ user: { role: 'teacher' } });
    expect([...set]).toEqual(['teacher']);
  });
  test('multi-role JWT unions role + roles[]', () => {
    const set = rolesOf({ user: { role: 'teacher', roles: ['teacher', 'parent'] } });
    expect([...set].sort()).toEqual(['parent', 'teacher']);
  });
  test('ignores falsy roles', () => {
    const set = rolesOf({ user: { role: 'admin', roles: ['admin', '', null] } });
    expect([...set]).toEqual(['admin']);
  });
  test('no user => empty set', () => {
    expect([...rolesOf({})]).toEqual([]);
  });
});

describe('authorizeRole middleware', () => {
  function run(user, allowed) {
    const req = { user };
    let status = 200, body = null, nexted = false;
    const res = { status(s) { status = s; return this; }, json(b) { body = b; return this; } };
    authorizeRole(allowed)(req, res, () => { nexted = true; });
    return { status, body, nexted };
  }

  test('no user => 401', () => {
    const r = run(undefined, ['teacher']);
    expect(r.status).toBe(401);
    expect(r.nexted).toBe(false);
  });
  test('single-role match => next()', () => {
    const r = run({ role: 'teacher' }, ['teacher']);
    expect(r.nexted).toBe(true);
    expect(r.status).toBe(200);
  });
  test('single-role mismatch => 403', () => {
    const r = run({ role: 'teacher' }, ['parent']);
    expect(r.status).toBe(403);
    expect(r.nexted).toBe(false);
  });
  test('multi-role account passes when any role allowed', () => {
    const r = run({ role: 'teacher', roles: ['teacher', 'parent'] }, ['parent']);
    expect(r.nexted).toBe(true);
  });
  test('accepts a bare string (non-array) allowedRoles', () => {
    const r = run({ role: 'admin' }, 'admin');
    expect(r.nexted).toBe(true);
  });
});
