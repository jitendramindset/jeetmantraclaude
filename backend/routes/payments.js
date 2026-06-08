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
    const { courseId, amount, currency } = req.body;
    const amt = Math.round(Number(amount) * 100);
    if (!amt || amt < 100) return res.status(400).json({ error: 'amount (₹1 min) required' });

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
    res.json({ message: 'Payment verified', paymentRowId });
  } catch (e) {
    console.error('verify error', e);
    res.status(500).json({ error: 'Verification failed' });
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
    const { data: payments, error } = await supabase
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
