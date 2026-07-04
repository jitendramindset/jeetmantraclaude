'use strict';
const crypto = require('crypto');
const { applyCoupon, commissionSplit, verifyRazorpaySignature } = require('../utils/money');

describe('applyCoupon', () => {
  test('percentage discount', () => {
    expect(applyCoupon(1000, { discount_percent: 10 })).toEqual({ original: 1000, discounted: 900, saved: 100 });
  });
  test('flat discount', () => {
    expect(applyCoupon(1000, { discount_flat: 500 })).toEqual({ original: 1000, discounted: 500, saved: 500 });
  });
  test('percent takes precedence over flat (matches inline if/else if)', () => {
    const r = applyCoupon(100, { discount_percent: 50, discount_flat: 30 });
    expect(r.discounted).toBe(50); // 50% applied, flat ignored
  });
  test('flat larger than price clamps to 0, never negative', () => {
    expect(applyCoupon(100, { discount_flat: 10000 })).toEqual({ original: 100, discounted: 0, saved: 100 });
  });
  test('100% off => 0', () => {
    expect(applyCoupon(1499, { discount_percent: 100 }).discounted).toBe(0);
  });
  test('no discount fields => unchanged', () => {
    expect(applyCoupon(750, {})).toEqual({ original: 750, discounted: 750, saved: 0 });
  });
  test('rounds fractional results', () => {
    // 33% off 100 = 67 (66.67 rounded)
    expect(applyCoupon(100, { discount_percent: 33 }).discounted).toBe(67);
  });
});

describe('commissionSplit', () => {
  test('15% default split', () => {
    expect(commissionSplit(1000, 15)).toEqual({ platformFee: 150, sellerEarnings: 850 });
  });
  test('20% split', () => {
    expect(commissionSplit(1000, 20)).toEqual({ platformFee: 200, sellerEarnings: 800 });
  });
  test('null rate falls back to 15 (matches `|| 15`)', () => {
    expect(commissionSplit(1000, null)).toEqual({ platformFee: 150, sellerEarnings: 850 });
  });
  test('0 rate falls back to 15 (0 is falsy — matches original behaviour)', () => {
    // Original: parseFloat(listing.commission_rate || 15) — 0 || 15 === 15
    expect(commissionSplit(1000, 0)).toEqual({ platformFee: 150, sellerEarnings: 850 });
  });
  test('seller + platform always sum to amount', () => {
    const { platformFee, sellerEarnings } = commissionSplit(999, 15);
    expect(platformFee + sellerEarnings).toBeCloseTo(999, 6);
  });
});

describe('verifyRazorpaySignature', () => {
  const secret = 'test-secret';
  const orderId = 'order_ABC';
  const paymentId = 'pay_XYZ';
  const goodSig = crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex');

  test('valid signature => true', () => {
    expect(verifyRazorpaySignature(orderId, paymentId, goodSig, secret)).toBe(true);
  });
  test('tampered signature => false', () => {
    expect(verifyRazorpaySignature(orderId, paymentId, goodSig.replace(/.$/, '0'), secret)).toBe(false);
  });
  test('tampered orderId => false', () => {
    expect(verifyRazorpaySignature('order_EVIL', paymentId, goodSig, secret)).toBe(false);
  });
  test('wrong secret => false', () => {
    expect(verifyRazorpaySignature(orderId, paymentId, goodSig, 'other-secret')).toBe(false);
  });
  test('missing inputs => false (never throws)', () => {
    expect(verifyRazorpaySignature('', paymentId, goodSig, secret)).toBe(false);
    expect(verifyRazorpaySignature(orderId, paymentId, goodSig, '')).toBe(false);
    expect(verifyRazorpaySignature(orderId, paymentId, undefined, secret)).toBe(false);
  });
});
