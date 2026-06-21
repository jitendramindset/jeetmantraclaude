/**
 * wallet.js — wallet balance, top-up via Razorpay, referrals, SaaS plans.
 * Phase 2B of the EduOS roadmap.
 */
const express = require('express');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { INSTITUTION_ROLES } = require('../config/roles');
const { validate } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RZP_MODE = RZP_KEY_ID && RZP_KEY_SECRET ? 'live' : 'demo';

// Helper: ensure a wallet row exists, return current balance.
async function ensureWallet(userId) {
  const { data } = await supabaseAdmin.from('wallets').select('*').eq('user_id', userId).maybeSingle();
  if (data) return data;
  const { data: created } = await supabaseAdmin.from('wallets').insert({
    user_id: userId, balance: 0
  }).select().single();
  return created;
}

// Helper: append a ledger entry + bump balance with a compare-and-swap so two
// concurrent debits can't both read the same balance and double-spend. The
// UPDATE only applies if the balance is still what we read (`.eq('balance',cur)`);
// if another request changed it first, the update matches 0 rows and we retry.
// A negative result is rejected (insufficient funds) before writing.
async function postTransaction(userId, type, amount, reference, notes) {
  const delta = Number(amount);
  for (let attempt = 0; attempt < 6; attempt++) {
    const w = await ensureWallet(userId);
    const cur = Number(w.balance) || 0;
    const newBalance = cur + delta;
    if (newBalance < 0) {
      const e = new Error('Insufficient wallet balance');
      e.code = 'INSUFFICIENT'; e.balance = cur;
      throw e;
    }
    const { data: updated } = await supabaseAdmin.from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId).eq('balance', cur).select();
    if (updated && updated.length) {
      await supabaseAdmin.from('wallet_transactions').insert({
        id: uuidv4(), user_id: userId, type, amount,
        balance_after: newBalance, reference, notes
      });
      return newBalance;
    }
    // Lost the race — another transaction changed the balance; re-read and retry.
  }
  const e = new Error('Wallet busy, please retry');
  e.code = 'CONFLICT';
  throw e;
}

// ── WALLET — balance + recent transactions.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const w = await ensureWallet(req.user.id);
    const { data: tx } = await supabaseAdmin.from('wallet_transactions')
      .select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(30);
    res.json({ balance: Number(w.balance) || 0, transactions: tx || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Top-up step 1: create a Razorpay order (or demo).
router.post('/topup/order', authenticateToken, validate('walletTopupOrder'), async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    if (!amount || amount < 50) return res.status(400).json({ error: 'min ₹50' });
    const amt = Math.round(amount * 100);
    if (RZP_MODE === 'demo') {
      return res.json({ mode: 'demo', orderId: 'demo_w_' + crypto.randomBytes(6).toString('hex'), amount: amt, currency: 'INR' });
    }
    const auth = 'Basic ' + Buffer.from(RZP_KEY_ID + ':' + RZP_KEY_SECRET).toString('base64');
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': auth },
      body: JSON.stringify({ amount: amt, currency: 'INR', receipt: 'wallet-' + req.user.id })
    });
    const data = await r.json();
    if (!r.ok) return res.status(400).json({ error: data.error?.description || 'order failed' });
    res.json({ mode: 'live', orderId: data.id, amount: amt, currency: 'INR', keyId: RZP_KEY_ID });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Top-up step 2: verify + credit. Demo orders auto-pass.
router.post('/topup/verify', authenticateToken, validate('walletTopupVerify'), async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body || {};
    let verified = false;
    if (RZP_MODE === 'demo' && String(razorpayOrderId || '').startsWith('demo_')) verified = true;
    else if (razorpayOrderId && razorpayPaymentId && razorpaySignature && RZP_KEY_SECRET) {
      const expected = crypto.createHmac('sha256', RZP_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId).digest('hex');
      verified = expected === razorpaySignature;
    }
    if (!verified) return res.status(400).json({ error: 'verification failed' });
    const amt = Number(amount);
    if (!amt || amt < 1) return res.status(400).json({ error: 'invalid amount' });
    const newBalance = await postTransaction(req.user.id, 'topup', amt,
      razorpayPaymentId || razorpayOrderId, 'Wallet top-up');
    res.json({ message: 'Wallet credited', balance: newBalance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Spend from wallet — debit. Called by checkout when wallet pays for a course.
router.post('/spend', authenticateToken, validate('walletSpend'), async (req, res) => {
  try {
    const { amount, reference, notes } = req.validatedData;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'amount required' });
    // The atomic debit inside postTransaction enforces sufficiency; no separate
    // read-then-check (which raced with concurrent spends).
    const newBalance = await postTransaction(req.user.id, 'spend', -amt, reference || null, notes || null);
    res.json({ message: 'Wallet debited', balance: newBalance });
  } catch (e) {
    if (e.code === 'INSUFFICIENT') return res.status(400).json({ error: 'Insufficient wallet balance', balance: e.balance });
    if (e.code === 'CONFLICT') return res.status(409).json({ error: 'Wallet busy, please retry' });
    res.status(500).json({ error: e.message });
  }
});

// ── REFERRALS ─────────────────────────────────────────────────────────
// Get-or-create a personal referral code.
router.get('/referrals/my-code', authenticateToken, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('referrals')
      .select('code').eq('referrer_id', req.user.id).is('referred_user_id', null).maybeSingle();
    if (existing) return res.json({ code: existing.code });
    // Generate a friendly 6-char code from a hash of the user id.
    const code = 'JM' + crypto.createHash('sha1').update(req.user.id + Date.now())
      .digest('hex').slice(0, 6).toUpperCase();
    await supabaseAdmin.from('referrals').insert({
      id: uuidv4(), referrer_id: req.user.id, code, reward_amount: 100
    });
    res.json({ code });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Apply a referral code at signup (or any time after). Both parties get
// ₹100 wallet credit; the referrer one is delayed until the referred user
// completes their first paid purchase — for demo simplicity, both get
// credited immediately.
router.post('/referrals/apply', authenticateToken, async (req, res) => {
  try {
    const code = String(req.body?.code || '').toUpperCase();
    if (!code) return res.status(400).json({ error: 'code required' });
    const { data: ref } = await supabaseAdmin.from('referrals')
      .select('*').eq('code', code).is('referred_user_id', null).maybeSingle();
    if (!ref) return res.status(404).json({ error: 'Invalid or used code' });
    if (ref.referrer_id === req.user.id) return res.status(400).json({ error: "Can't refer yourself" });
    await supabaseAdmin.from('referrals').update({
      referred_user_id: req.user.id, claimed_at: new Date().toISOString()
    }).eq('id', ref.id);
    const amt = Number(ref.reward_amount) || 100;
    await postTransaction(req.user.id, 'referral_bonus', amt, code, 'Referral signup bonus');
    await postTransaction(ref.referrer_id, 'referral_bonus', amt, code, 'Friend joined via your code');
    res.json({ message: 'Referral applied — ₹' + amt + ' credited to your wallet', credited: amt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SAAS PLANS ────────────────────────────────────────────────────────
// Public — anyone can see the pricing.
router.get('/plans', async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('platform_plans').select('*').order('price_monthly');
    res.json({ plans: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Current subscription for the authenticated user.
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('subscriptions')
      .select('*').eq('user_id', req.user.id).eq('status', 'active').order('started_at', { ascending: false }).maybeSingle();
    res.json({ subscription: data || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Subscribe (institutions / creators / admin). Demo: marks active for 30d
// (monthly) or 365d (yearly). Real flow would call Razorpay Subscriptions.
router.post('/subscribe', authenticateToken, authorizeRole([...INSTITUTION_ROLES, 'teacher', 'partner', 'content_creator', 'corporate_trainer']), validate('walletSubscribe'), async (req, res) => {
  try {
    const { planCode, billingPeriod } = req.validatedData;
    const { data: plan } = await supabaseAdmin.from('platform_plans').select('*').eq('code', planCode).maybeSingle();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    const period = billingPeriod === 'yearly' ? 'yearly' : 'monthly';
    const days = period === 'yearly' ? 365 : 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    // Deactivate any existing active subs.
    await supabaseAdmin.from('subscriptions').update({ status: 'replaced' })
      .eq('user_id', req.user.id).eq('status', 'active');
    const { data, error } = await supabaseAdmin.from('subscriptions').insert({
      id: uuidv4(), user_id: req.user.id, plan_code: planCode,
      plan_name: plan.name, amount: period === 'yearly' ? plan.price_yearly : plan.price_monthly,
      billing_cycle: period, billing_period: period,
      status: 'active', started_at: new Date().toISOString(), expires_at: expiresAt
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ subscription: data, plan });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
