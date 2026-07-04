/**
 * utils/money.js — pure money/security helpers, extracted so they can be
 * unit-tested and reused instead of duplicated inline across routes.
 *
 * Every function here is PURE (no DB, no IO) and preserves the exact behaviour
 * of the inline code it replaces in payments.js / marketplace.js / wallet.js.
 */
const crypto = require('crypto');

/**
 * applyCoupon — discounted price for an order.
 * Mirrors routes/payments.js /coupons/apply. Percent takes precedence over
 * flat (matches the original `if/else if`). Result never goes below 0, and the
 * money values are rounded to whole units (paise-free rupees) as before.
 *
 * @param {number} amount           original order amount
 * @param {object} coupon           { discount_percent?, discount_flat? }
 * @returns {{original:number, discounted:number, saved:number}}
 */
function applyCoupon(amount, coupon = {}) {
  const orig = Number(amount);
  let discounted = orig;
  if (coupon.discount_percent) discounted = orig - (orig * Number(coupon.discount_percent) / 100);
  else if (coupon.discount_flat) discounted = orig - Number(coupon.discount_flat);
  if (discounted < 0) discounted = 0;
  return {
    original: orig,
    discounted: Math.round(discounted),
    saved: Math.round(orig - discounted),
  };
}

/**
 * commissionSplit — platform fee vs seller earnings for a marketplace sale.
 * Mirrors routes/marketplace.js /purchase. `ratePercent` is a whole-number
 * percent (e.g. 15 = 15%); falls back to 15 when null/undefined, matching
 * `parseFloat(listing.commission_rate || 15)`.
 *
 * @param {number} amount           sale amount
 * @param {number} ratePercent      commission rate as a percent (default 15)
 * @returns {{platformFee:number, sellerEarnings:number}}
 */
function commissionSplit(amount, ratePercent) {
  const commRate = parseFloat(ratePercent || 15) / 100;
  const platformFee = amount * commRate;
  const sellerEarnings = amount - platformFee;
  return { platformFee, sellerEarnings };
}

/**
 * verifyRazorpaySignature — constant-message HMAC-SHA256 check.
 * Mirrors routes/payments.js /verify and routes/wallet.js topup verify.
 * Returns false on any missing input (never throws).
 *
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature        signature sent by the client
 * @param {string} secret           Razorpay key secret
 * @returns {boolean}
 */
function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret)
    .update(orderId + '|' + paymentId).digest('hex');
  return expected === signature;
}

module.exports = { applyCoupon, commissionSplit, verifyRazorpaySignature };
