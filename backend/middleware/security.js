/**
 * security.js — production hardening middleware (audit H1–H4).
 *
 * Applies, in order: trust proxy (correct client IP behind Traefik), helmet
 * (security headers), compression (gzip), and rate limiting (a lenient global
 * cap + a strict cap on auth/AI/payment endpoints).
 *
 * Each dependency is loaded defensively: if it isn't installed yet (e.g. a dev
 * who hasn't run `npm install`), the app still boots — it just logs a warning
 * and skips that layer. The production Docker image installs them all.
 */
function optional(name) { try { return require(name); } catch (_) { console.warn(`[security] ${name} not installed — skipping (run npm install)`); return null; } }

function applySecurity(app) {
  const isProd = process.env.NODE_ENV === 'production';

  // Behind a reverse proxy (Traefik/Caddy/nginx) → trust X-Forwarded-* so
  // req.ip and rate-limiting/audit log the real client, not the proxy.
  app.set('trust proxy', 1);

  const helmet = optional('helmet');
  if (helmet) {
    app.use(helmet({
      // The single-file HTML SPAs use inline styles/scripts + CDN React/Babel on
      // a couple of pages, so a strict CSP would break them. Keep the other
      // protections (HSTS, noSniff, frameguard) and leave CSP off until the
      // frontend is bundled/nonce'd.
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      hsts: isProd ? { maxAge: 15552000, includeSubDomains: true } : false
    }));
  }

  const compression = optional('compression');
  if (compression) app.use(compression());

  const rateLimit = optional('express-rate-limit');
  if (rateLimit) {
    // Global: generous, just stops runaway abuse.
    app.use('/api/', rateLimit({
      windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_GLOBAL || 300),
      standardHeaders: true, legacyHeaders: false,
      message: { error: 'Too many requests — slow down.' }
    }));
    // Strict: auth, AI generation, payments — brute-force / cost-abuse surfaces.
    const strict = rateLimit({
      windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_STRICT || 20),
      standardHeaders: true, legacyHeaders: false,
      message: { error: 'Too many attempts — please wait a minute.' }
    });
    ['/api/auth/login', '/api/auth/signup', '/api/auth/send-otp', '/api/auth/verify-otp',
     '/api/auth/forgot-password', '/api/ai', '/api/payments/order', '/api/payments/verify'].forEach(p => app.use(p, strict));
  }
}

module.exports = { applySecurity };
