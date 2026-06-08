const express = require('express');
const crypto = require('crypto');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ── Razorpay configuration: keys come from env; falls back to "demo" mode
// so the UI flow can be exercised without real keys (useful for dev).
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RZP_MODE = RZP_KEY_ID && RZP_KEY_SECRET ? 'live' : 'demo';

// ── COUPONS: validate a code + apply against an amount. Returns the
// discounted amount the order should be created with.
router.post('/coupons/apply', authenticateToken, async (req, res) => {
  try {
    const { code, amount, courseId } = req.body || {};
    if (!code || !amount) return res.status(400).json({ error: 'code + amount required' });
    const { data: c } = await supabaseAdmin.from('coupons').select('*').eq('code', String(code).toUpperCase()).maybeSingle();
    if (!c) return res.status(404).json({ error: 'Invalid coupon code' });
    if (c.expires_at && new Date(c.expires_at) < new Date()) return res.status(400).json({ error: 'Coupon expired' });
    if (c.used_count >= c.max_uses) return res.status(400).json({ error: 'Coupon exhausted' });
    if (c.course_id && c.course_id !== courseId) return res.status(400).json({ error: 'Coupon not valid for this course' });
    const orig = Number(amount);
    let discounted = orig;
    if (c.discount_percent) discounted = orig - (orig * Number(c.discount_percent) / 100);
    else if (c.discount_flat) discounted = orig - Number(c.discount_flat);
    if (discounted < 0) discounted = 0;
    res.json({ original: orig, discounted: Math.round(discounted), saved: Math.round(orig - discounted), code: c.code });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Teacher creates a coupon (owner of the course gets to issue codes).
router.post('/coupons', authenticateToken, async (req, res) => {
  try {
    const { code, discountPercent, discountFlat, courseId, maxUses, expiresAt } = req.body || {};
    if (!code) return res.status(400).json({ error: 'code required' });
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
router.post('/order', authenticateToken, async (req, res) => {
  try {
    const { courseId, amount, currency, couponCode } = req.body;
    let appliedAmount = Number(amount);
    let coupon = null;
    // Re-validate coupon server-side (don't trust client discount).
    if (couponCode) {
      const { data: c } = await supabaseAdmin.from('coupons').select('*').eq('code', String(couponCode).toUpperCase()).maybeSingle();
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
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { paymentRowId, razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;
    if (!paymentRowId) return res.status(400).json({ error: 'paymentRowId required' });

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
    // Increment coupon use_count if one was applied (read from the persisted
    // payments row's notes — simplest: client sends couponCode again on verify).
    if (req.body?.couponCode) {
      await supabaseAdmin.rpc('increment_coupon', { p_code: String(req.body.couponCode).toUpperCase() }).catch(async () => {
        // RPC may not exist — fall back to read-then-update.
        const { data: c } = await supabaseAdmin.from('coupons').select('used_count').eq('code', String(req.body.couponCode).toUpperCase()).maybeSingle();
        if (c) await supabaseAdmin.from('coupons').update({ used_count: (Number(c.used_count) || 0) + 1 }).eq('code', String(req.body.couponCode).toUpperCase());
      });
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

// Refund — production would call Razorpay's /payments/:id/refund endpoint.
router.post('/:id/refund', authenticateToken, async (req, res) => {
  try {
    const { data: p } = await supabaseAdmin.from('payments').select('*').eq('id', req.params.id).single();
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    if (p.status === 'refunded') return res.status(400).json({ error: 'Already refunded' });
    await supabaseAdmin.from('payments').update({
      status: 'refunded', updated_at: new Date().toISOString()
    }).eq('id', req.params.id);
    res.json({ message: 'Refund recorded' });
  } catch (e) { res.status(500).json({ error: 'Refund failed' }); }
});

// Create payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId, amount, paymentMethod } = req.body;
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

// Update payment status (webhook from payment gateway)
router.post('/webhook/payment', async (req, res) => {
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

module.exports = router;
