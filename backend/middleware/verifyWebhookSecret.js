/**
 * verifyWebhookSecret — shared shared-secret guard for inbound webhooks.
 *
 * Why a separate helper instead of reusing n8n's verifyN8nSignature:
 *   - n8n.js intentionally allows unset secret (dev convenience for the n8n addon)
 *     because it ALSO requires a workflow id to take any action.
 *   - The generic /api/webhooks and legacy /api/payments/webhook/payment can
 *     CREATE ACCOUNTS or move money straight from the body. Missing secret in
 *     production there is unauthenticated-account-creation / payment-spoof.
 *
 * Behavior:
 *   - In production (NODE_ENV=production) with the env var unset → REJECT.
 *     Misconfiguration must fail closed, not open the door.
 *   - With the env var set → header must match in constant time (timingSafeEqual).
 *   - In dev with the env var unset → allow (so local testing still works).
 *     A WARN is logged so it can't be missed.
 *
 * Header accepted on the X-JM-Webhook-Secret line; also reads X-Webhook-Secret
 * for back-compat with existing n8n callers.
 */
const crypto = require('crypto');

function constantTimeEq(a, b) {
  const A = Buffer.from(String(a || ''), 'utf8');
  const B = Buffer.from(String(b || ''), 'utf8');
  if (A.length !== B.length) return false;
  try { return crypto.timingSafeEqual(A, B); } catch (_) { return false; }
}

// Express middleware factory. Pass the ENV var name (e.g. 'WEBHOOK_SECRET')
// and a label for diagnostics ('webhooks', 'payments-legacy', ...).
function verifyWebhookSecret(envVar, label) {
  return function (req, res, next) {
    const expected = process.env[envVar] || process.env.WEBHOOK_SECRET || '';
    const got = req.headers['x-jm-webhook-secret'] || req.headers['x-webhook-secret'] || '';
    if (!expected) {
      if (process.env.NODE_ENV === 'production') {
        console.error(`[webhook:${label}] ${envVar} unset in production — refusing inbound request`);
        return res.status(503).json({ error: 'Webhook receiver not configured' });
      }
      console.warn(`[webhook:${label}] ${envVar} unset (dev mode) — accepting unsigned request. Set ${envVar} before deploying.`);
      return next();
    }
    if (!constantTimeEq(got, expected)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    next();
  };
}

module.exports = { verifyWebhookSecret };
