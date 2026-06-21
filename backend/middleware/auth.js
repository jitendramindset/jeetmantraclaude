const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Resolve the set of roles a request holds. Multi-role support added in S2-5:
//   - JWTs minted by older code carry a single { role: 'teacher' } claim.
//   - JWTs minted by S2-5+ code carry { role, roles: ['teacher','parent',...] }.
// Either way we always include req.user.role (the primary/display role) so
// existing logic that reads it elsewhere continues to work. The union is
// computed PER REQUEST (no DB lookup) — the JWT is the source of truth, kept
// fresh on login. If a role is granted mid-session the user re-logs to pick it up.
function rolesOf(req) {
  const out = new Set();
  if (req.user && req.user.role) out.add(req.user.role);
  if (req.user && Array.isArray(req.user.roles)) {
    for (const r of req.user.roles) if (r) out.add(r);
  }
  return out;
}

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const have = rolesOf(req);
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const ok = allowed.some(r => have.has(r));
    if (!ok) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowed,
        current: req.user.role,
        currentAll: [...have]
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  rolesOf
};
