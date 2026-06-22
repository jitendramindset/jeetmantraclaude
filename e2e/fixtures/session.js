// EduOS E2E session helpers (CommonJS).
//
// TWO DISTINCT AUTH PATHS — choose deliberately:
//
//   seedSession(page, role)  -> FRONTEND ROLE-GATING ONLY.
//     Plants a fake (UNSIGNED) JWT + user object in localStorage under the SAME
//     keys the app uses (jm_token / jm_user) BEFORE the first navigation, via
//     page.addInitScript. The backend will REJECT this token, so use it only to
//     exercise client-side gating: which dashboard widgets/menus/pages a role is
//     allowed to see. Any spec that actually hits /api/* with auth will get 401.
//
//   loginViaApi(request, baseURL, email, password) -> REAL BACKEND AUTH.
//     POSTs to /api/auth/login with real seeded credentials and returns a real
//     {token, user}. Gate these specs behind env E2E_REAL_CREDS so they don't
//     run (and fail) in environments without a seeded DB.
//
// The app's storeAuth() does:
//   localStorage.setItem('jm_token', token);
//   localStorage.setItem('jm_user', JSON.stringify(user));
// We mirror those exact keys here.

const TOKEN_KEY = 'jm_token';
const USER_KEY = 'jm_user';

/** base64url-encode a UTF-8 string (no padding) — works in Node. */
function base64url(str) {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * makeFakeJwt(payload) -> string
 * Returns a syntactically JWT-shaped 'header.body.sig' string with a real
 * base64url-encoded JSON body. NOT cryptographically signed — the signature
 * segment is a fixed placeholder. For frontend-gating tests only; the backend
 * will not accept it.
 */
function makeFakeJwt(payload = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    iat: now,
    exp: now + 60 * 60 * 24, // +24h so client-side expiry checks pass
    ...payload,
  };
  const sig = 'e2e-not-a-real-signature';
  return `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}.${base64url(sig)}`;
}

/**
 * fakeUser(role) -> user object
 * Mirrors the shape the frontend stores in jm_user.
 */
function fakeUser(role) {
  return {
    id: 'e2e-' + role,
    email: role + '@e2e.test',
    full_name: 'E2E ' + role,
    role,
    user_type: role,
    roles: [role],
  };
}

/**
 * seedSession(page, role) -> Promise<user>
 * Installs an init script (runs before any page script on every navigation in
 * this context) that writes jm_token + jm_user into localStorage. Call BEFORE
 * page.goto(...) so auth state is present on first load. Returns the user object
 * that was seeded.
 */
async function seedSession(page, role) {
  const user = fakeUser(role);
  const token = makeFakeJwt({ sub: user.id, role, user_type: role });
  await page.addInitScript(
    ([tokenKey, userKey, tok, usr]) => {
      try {
        localStorage.setItem(tokenKey, tok);
        localStorage.setItem(userKey, usr);
      } catch (e) {
        // ignore storage errors (e.g. first init before origin is set)
      }
    },
    [TOKEN_KEY, USER_KEY, token, JSON.stringify(user)]
  );
  return user;
}

/**
 * clearSession(page) -> Promise<void>
 * Installs an init script that clears localStorage on every navigation, so the
 * page loads in a logged-out state.
 */
async function clearSession(page) {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch (e) {
      /* ignore */
    }
  });
}

/**
 * loginViaApi(request, baseURL, email, password) -> Promise<{token, user}>
 * REAL backend auth. Uses a Playwright APIRequestContext to POST
 * /api/auth/login. Throws if the response is not OK or lacks a token.
 * Gate callers behind env E2E_REAL_CREDS.
 */
async function loginViaApi(request, baseURL, email, password) {
  const base = (baseURL || process.env.E2E_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
  const res = await request.post(base + '/api/auth/login', {
    data: { email, password },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) {
    let body = '';
    try {
      body = await res.text();
    } catch (e) {
      /* ignore */
    }
    throw new Error(`loginViaApi failed: ${res.status()} ${res.statusText()} ${body}`.trim());
  }
  const json = await res.json();
  if (!json || !json.token) {
    throw new Error('loginViaApi: response missing token: ' + JSON.stringify(json));
  }
  return { token: json.token, user: json.user };
}

module.exports = {
  TOKEN_KEY,
  USER_KEY,
  makeFakeJwt,
  fakeUser,
  seedSession,
  clearSession,
  loginViaApi,
};
