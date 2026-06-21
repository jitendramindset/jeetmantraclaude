const express = require('express');
const crypto = require('crypto');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { verifyWebhookSecret } = require('../middleware/verifyWebhookSecret');
const { validate } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ── Razorpay configuration: keys come from env; falls back to "demo" mode
// so the UI flow can be exercised without real keys (useful for dev).
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RZP_MODE = RZP_KEY_ID && RZP_KEY_SECRET ? 'live' : 'demo';

// Has this user already redeemed this coupon? Backed by the coupon_redemptions
// table (UNIQUE(coupon_code,user_id)). Returns false if the table is missing so
// the flow degrades to the global max_uses cap rather than breaking.
async function couponRedeemedBy(code, userId) {
  try {
    const { data } = await supabaseAdmin.from('coupon_redemptions')
      .select('id').eq('coupon_code', code).eq('user_id', userId).maybeSingle();
    return !!data;
  } catch (e) { return false; }
}

// ── COUPONS: validate a code + apply against an amount. Returns the
// discounted amount the order should be created with.
router.post('/coupons/apply', authenticateToken, validate('couponApply'), async (req, res) => {
  try {
    const { code, amount, courseId } = req.validatedData;
    const { data: c } = await supabaseAdmin.from('coupons').select('*').eq('code', String(code).toUpperCase()).maybeSingle();
    if (!c) return res.status(404).json({ error: 'Invalid coupon code' });
    if (c.expires_at && new Date(c.expires_at) < new Date()) return res.status(400).json({ error: 'Coupon expired' });
    if (c.used_count >= c.max_uses) return res.status(400).json({ error: 'Coupon exhausted' });
    if (c.course_id && c.course_id !== courseId) return res.status(400).json({ error: 'Coupon not valid for this course' });
    if (await couponRedeemedBy(c.code, req.user.id)) return res.status(400).json({ error: 'You have already used this coupon.' });
    const orig = Number(amount);
    let discounted = orig;
    if (c.discount_percent) discounted = orig - (orig * Number(c.discount_percent) / 100);
    else if (c.discount_flat) discounted = orig - Number(c.discount_flat);
    if (discounted < 0) discounted = 0;
    res.json({ original: orig, discounted: Math.round(discounted), saved: Math.round(orig - discounted), code: c.code });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Teacher creates a coupon (owner of the course gets to issue codes).
router.post('/coupons', authenticateToken, validate('couponCreate'), async (req, res) => {
  try {
    const { code, discountPercent, discountFlat, courseId, maxUses, expiresAt } = req.validatedData;
    if (courseId) {
      const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
      if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    }
    const { error } = await supabaseAdmin.from('coupons').insert({
      code: String(code).toUpperCase(), owner_id: req.user.id,
      discount_percent: discountPercent ? Number(discountPercent) : null,
      discount_flat: discountFlat ? Number(discountFlat) : null,
      course_id: courseId || null, max_uses: Number(maxUses) || 100,
      expires_at: expiresAt || null
    });
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Coupon created' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// List the caller's own coupons (with course titles).
router.get('/coupons', authenticateToken, async (req, res) => {
  try {
    const { data: coupons } = await supabaseAdmin.from('coupons').select('*').eq('owner_id', req.user.id).order('created_at', { ascending: false });
    const cids = [...new Set((coupons || []).map(c => c.course_id).filter(Boolean))];
    let titles = {};
    if (cids.length) {
      const { data: courses } = await supabaseAdmin.from('courses').select('id, title').in('id', cids);
      titles = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
    }
    res.json({ coupons: (coupons || []).map(c => ({ ...c, course_title: c.course_id ? (titles[c.course_id] || 'Course') : 'All courses' })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete a coupon you own.
router.delete('/coupons/:id', authenticateToken, async (req, res) => {
  try {
    const { data: c } = await supabaseAdmin.from('coupons').select('owner_id').eq('id', req.params.id).single();
    if (!c || c.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your coupon' });
    await supabaseAdmin.from('coupons').delete().eq('id', req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public config — anything the browser checkout needs.
router.get('/config', (req, res) => {
  res.json({
    keyId: RZP_KEY_ID || null,
    mode: RZP_MODE,
    methods: ['upi', 'card', 'netbanking', 'wallet'],
    currency: 'INR'
  });
});

// Create a Razorpay order (or a demo order when no keys configured).
// Body: { courseId, amount, currency? } — amount in rupees; converted to paise.
router.post('/order', authenticateToken, validate('paymentOrder'), async (req, res) => {
  try {
    const { courseId, amount, currency, couponCode } = req.validatedData;
    let appliedAmount = Number(amount);
    let coupon = null;
    // Re-validate coupon server-side (don't trust client discount).
    if (couponCode) {
      const { data: c } = await supabaseAdmin.from('coupons').select('*').eq('code', String(couponCode).toUpperCase()).maybeSingle();
      const alreadyUsed = c ? await couponRedeemedBy(c.code, req.user.id) : false;
      if (alreadyUsed) return res.status(400).json({ error: 'You have already used this coupon.' });
      if (c && (!c.expires_at || new Date(c.expires_at) > new Date()) && c.used_count < c.max_uses && (!c.course_id || c.course_id === courseId)) {
        if (c.discount_percent) appliedAmount = appliedAmount - (appliedAmount * Number(c.discount_percent) / 100);
        else if (c.discount_flat) appliedAmount = appliedAmount - Number(c.discount_flat);
        if (appliedAmount < 0) appliedAmount = 0;
        coupon = c;
      }
    }
    const amt = Math.round(appliedAmount * 100);
    if (!amt || amt < 100) return res.status(400).json({ error: 'amount (₹1 min) required after discount' });

    const paymentId = uuidv4();
    await supabaseAdmin.from('payments').insert({
      id: paymentId, user_id: req.user.id, course_id: courseId || null,
      amount, payment_method: 'razorpay', status: 'pending',
      created_at: new Date().toISOString()
    });

    if (RZP_MODE === 'demo') {
      return res.json({
        mode: 'demo', orderId: 'demo_' + paymentId.slice(0, 12),
        amount: amt, currency: currency || 'INR', paymentRowId: paymentId
      });
    }

    const body = JSON.stringify({ amount: amt, currency: currency || 'INR', receipt: paymentId });
    const auth = 'Basic ' + Buffer.from(RZP_KEY_ID + ':' + RZP_KEY_SECRET).toString('base64');
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': auth }, body
    });
    const data = await r.json();
    if (!r.ok) return res.status(400).json({ error: data.error?.description || 'Razorpay order failed' });
    await supabaseAdmin.from('payments').update({ transaction_id: data.id }).eq('id', paymentId);
    res.json({ mode: 'live', orderId: data.id, amount: amt, currency: data.currency, paymentRowId: paymentId, keyId: RZP_KEY_ID });
  } catch (e) {
    console.error('order error', e);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

// Verify checkout result. Live: HMAC-SHA256(orderId|paymentId, secret) must
// match the signature Razorpay returned. Demo: accept any "demo_*" order id.
router.post('/verify', authenticateToken, validate('paymentVerify'), async (req, res) => {
  try {
    const { paymentRowId, razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.validatedData;

    // The payment row must exist, belong to the caller, and still be pending —
    // otherwise a user could verify someone else's order or re-verify a row to
    // enroll for free (esp. in demo mode where any demo_* id "passes").
    const { data: payRow } = await supabaseAdmin.from('payments').select('id, user_id, status, course_id').eq('id', paymentRowId).maybeSingle();
    if (!payRow) return res.status(404).json({ error: 'Payment not found' });
    if (payRow.user_id !== req.user.id) return res.status(403).json({ error: 'Not your payment' });
    if (payRow.status === 'paid') return res.json({ message: 'Already verified', paymentRowId });
    if (payRow.status !== 'pending') return res.status(400).json({ error: 'Payment is not pending' });

    let verified = false;
    if (RZP_MODE === 'demo' && String(razorpayOrderId || '').startsWith('demo_')) {
      verified = true;
    } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature && RZP_KEY_SECRET) {
      const expected = crypto.createHmac('sha256', RZP_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId).digest('hex');
      verified = expected === razorpaySignature;
    }
    if (!verified) return res.status(400).json({ error: 'Signature verification failed' });

    await supabaseAdmin.from('payments').update({
      status: 'paid',
      transaction_id: razorpayPaymentId || ('demo_txn_' + Date.now()),
      updated_at: new Date().toISOString()
    }).eq('id', paymentRowId);

    if (courseId) {
      const { data: existing } = await supabaseAdmin.from('enrollments')
        .select('id').eq('student_id', req.user.id).eq('course_id', courseId).maybeSingle();
      if (!existing) {
        await supabaseAdmin.from('enrollments').insert({
          id: uuidv4(), student_id: req.user.id, course_id: courseId,
          enrolled_at: new Date().toISOString(), status: 'active'
        });
      }
    }
    // Record the coupon redemption (per-user) and bump the global used_count.
    // The coupon_redemptions UNIQUE(coupon_code,user_id) makes this idempotent:
    // a repeat redemption by the same user hits the unique constraint and does
    // NOT double-count. If the table is missing we fall back to counting (so the
    // global max_uses cap still applies).
    if (req.body?.couponCode) {
      const code = String(req.body.couponCode).toUpperCase();
      let firstRedemption = true;
      try {
        const { error: insErr } = await supabaseAdmin.from('coupon_redemptions')
          .insert({ coupon_code: code, user_id: req.user.id, payment_id: paymentRowId });
        if (insErr && (insErr.code === '23505' || /duplicate|unique/i.test(insErr.message || ''))) {
          firstRedemption = false; // already redeemed by this user → don't re-count
        }
      } catch (e) { /* table missing → behave as before */ }
      if (firstRedemption) {
        for (let i = 0; i < 5; i++) {
          const { data: c } = await supabaseAdmin.from('coupons').select('used_count, max_uses').eq('code', code).maybeSingle();
          if (!c) break;
          const cur = Number(c.used_count) || 0;
          if (cur >= Number(c.max_uses)) break;
          const { data: upd } = await supabaseAdmin.from('coupons')
            .update({ used_count: cur + 1 }).eq('code', code).eq('used_count', cur).select();
          if (upd && upd.length) break;
        }
      }
    }
    res.json({ message: 'Payment verified', paymentRowId });
  } catch (e) {
    console.error('verify error', e);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── WEBHOOK: server-side payment confirmation. Configure this URL in the
// Razorpay dashboard with the same secret as RAZORPAY_WEBHOOK_SECRET so the
// X-Razorpay-Signature header can be verified. Independent of the client —
// even if the user closes the browser, payment.captured arrives here and
// flips status to paid + auto-enrolls.
//
// IMPORTANT: mounted with express.raw() in server.js so the raw body bytes
// (not the JSON-parsed body) are signed.
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || RZP_KEY_SECRET;
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['x-razorpay-signature'];
    const raw = req.body; // Buffer
    if (!sig || !raw) return res.status(400).end();
    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
    if (expected !== sig) {
      console.warn('webhook signature mismatch');
      return res.status(400).end();
    }
    const body = JSON.parse(raw.toString('utf8'));
    const event = body.event;
    const entity = body.payload?.payment?.entity || {};
    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId = entity.order_id;
      const paymentId = entity.id;
      // Our /order endpoint stored Razorpay's order id in payments.transaction_id.
      const { data: row } = await supabaseAdmin.from('payments')
        .select('*').eq('transaction_id', orderId).maybeSingle();
      if (row) {
        await supabaseAdmin.from('payments').update({
          status: 'paid', transaction_id: paymentId,
          updated_at: new Date().toISOString()
        }).eq('id', row.id);
        if (row.course_id && row.user_id) {
          const { data: existing } = await supabaseAdmin.from('enrollments')
            .select('id').eq('student_id', row.user_id).eq('course_id', row.course_id).maybeSingle();
          if (!existing) {
            await supabaseAdmin.from('enrollments').insert({
              id: uuidv4(), student_id: row.user_id, course_id: row.course_id,
              enrolled_at: new Date().toISOString(), status: 'active'
            });
          }
        }
      }
    } else if (event === 'payment.failed') {
      const orderId = entity.order_id;
      await supabaseAdmin.from('payments').update({
        status: 'failed', updated_at: new Date().toISOString()
      }).eq('transaction_id', orderId);
    }
    res.json({ received: true });
  } catch (e) {
    console.error('webhook error', e);
    res.status(500).end();
  }
});

// Refund — privileged. Production would call Razorpay's /payments/:id/refund.
router.post('/:id/refund', authenticateToken, async (req, res) => {
  try {
    // Refunds are an admin-only operation (move money back). Previously any
    // authenticated user could refund any payment by id (IDOR).
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can issue refunds' });
    const { data: p } = await supabaseAdmin.from('payments').select('*').eq('id', req.params.id).single();
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    if (p.status === 'refunded') return res.status(400).json({ error: 'Already refunded' });
    // Only a paid payment can be refunded.
    if (p.status !== 'paid') return res.status(400).json({ error: 'Only paid payments can be refunded' });
    await supabaseAdmin.from('payments').update({
      status: 'refunded', updated_at: new Date().toISOString()
    }).eq('id', req.params.id);
    // P0H-3: audit refund. Money-moving admin write must be reconstructable
    // from the audit log alone (actor + before/after + IP/UA).
    try {
      await supabaseAdmin.from('audit_log').insert({
        id: uuidv4(),
        actor_id: req.user.id,
        action: 'payment.refund',
        target_id: req.params.id,
        metadata: {
          before: { status: p.status },
          after:  { status: 'refunded' },
          amount: p.amount,
          user_id: p.user_id,
          course_id: p.course_id,
          actor_ip: req.ip || req.headers['x-forwarded-for'] || null,
          user_agent: req.headers['user-agent'] || null
        },
        occurred_at: new Date().toISOString()
      });
    } catch (_) { /* audit best-effort */ }
    res.json({ message: 'Refund recorded' });
  } catch (e) { res.status(500).json({ error: 'Refund failed' }); }
});

// Create payment
router.post('/', authenticateToken, validate('paymentCreate'), async (req, res) => {
  try {
    const { courseId, amount, paymentMethod } = req.validatedData;
    const paymentId = uuidv4();

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .insert({
        id: paymentId,
        user_id: req.user.id,
        course_id: courseId,
        amount,
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create payment' });
    }

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Get payment history
router.get('/my', authenticateToken, async (req, res) => {
  try {
    // supabaseAdmin: the self-hosted anon key is invalid / lacks grants on
    // some tables (payments among them), so always use the service client.
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }

    res.json({
      message: 'Payments fetched successfully',
      payments
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Update payment status (legacy webhook from payment gateway). Previously
// unauthenticated — anyone could mark any paymentId as 'completed'. Now requires
// X-JM-Webhook-Secret (back-compat X-Webhook-Secret) matching env
// PAYMENT_WEBHOOK_SECRET (or the generic WEBHOOK_SECRET fallback). The modern
// path is POST /webhook (Razorpay HMAC) — this remains only for non-Razorpay
// legacy callers.
router.post('/webhook/payment', verifyWebhookSecret('PAYMENT_WEBHOOK_SECRET', 'payments-legacy'), async (req, res) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .update({
        status,
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update payment' });
    }

    res.json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ── Student-facing payment receipt / invoice PDF (HTML for print-to-PDF)
router.get('/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { data: p } = await supabaseAdmin.from('payments').select('*, courses(title,category)').eq('id', req.params.id).single();
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    if (p.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not yours' });
    const { data: user } = await supabaseAdmin.from('jeetmantra_users').select('full_name, email, phone').eq('id', p.user_id).single();
    const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${esc(p.id.slice(0,8))}</title>
<style>
@page{size:A4;margin:0}body{margin:0;font-family:'Segoe UI',sans-serif;color:#111;padding:32px;background:#f8f7fc;min-height:100vh}
.sheet{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,.06)}
.row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}
h1{font-size:28px;letter-spacing:-.02em;color:#f97316;margin:0}
.label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#888;font-weight:700;margin-bottom:4px}
.total{font-size:28px;font-weight:800;color:#f97316;margin:20px 0}
.no-print{text-align:center;margin-bottom:14px}
@media print{.no-print{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0}}
button{padding:8px 18px;border:0;border-radius:6px;background:#f97316;color:#fff;cursor:pointer;font-weight:700}
.status{display:inline-block;padding:4px 14px;border-radius:20px;font-weight:700;font-size:13px;text-transform:uppercase}
.status-paid{background:#d1fae5;color:#059669}.status-pending{background:#fef3c7;color:#d97706}.status-failed{background:#fce4ec;color:#c62828}.status-refunded{background:#e0e7ff;color:#4338ca}
</style></head><body>
<div class="no-print"><button onclick="window.print()">🖨 Print / Save as PDF</button></div>
<div class="sheet">
  <div class="row"><div><h1>PAYMENT RECEIPT</h1><div class="label" style="margin-top:6px">JeetMantra EduOS</div></div><div style="text-align:right"><div class="label">Receipt #</div>${esc(p.id.slice(0,8).toUpperCase())}<br><div class="label" style="margin-top:8px">Date</div>${new Date(p.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div></div>
  <div class="row"><div><div class="label">Student</div><strong>${esc(user?.full_name || 'Student')}</strong><div style="font-size:12px;color:#666">${esc(user?.email || '')}${user?.phone ? '<br>' + esc(user.phone) : ''}</div></div><div style="text-align:right"><div class="label">Status</div><span class="status status-${esc(p.status)}">${esc(p.status)}</span></div></div>
  <div style="border:1px solid #f0eff5;border-radius:10px;padding:20px;margin-bottom:20px">
    <div class="label">Course</div><div style="font-size:18px;font-weight:700;margin:4px 0">${esc(p.courses?.title || 'Course')}</div>
    <div style="font-size:13px;color:#666">${esc(p.courses?.category || 'General')} · Payment method: ${esc(p.payment_method || 'Razorpay')}</div>
    ${p.transaction_id ? `<div style="font-size:11px;color:#999;margin-top:4px">Txn: ${esc(p.transaction_id)}</div>` : ''}
  </div>
  <div class="total">${fmt(p.amount)}</div>
  <div style="font-size:12px;color:#999;border-top:1px solid #f0eff5;padding-top:14px">This is a computer-generated receipt. Thank you for choosing JeetMantra.</div>
</div></body></html>`);
  } catch (e) { res.status(500).json({ error: 'Receipt failed: ' + e.message }); }
});

module.exports = router;
