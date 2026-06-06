const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

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
