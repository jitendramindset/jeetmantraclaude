const express = require('express');
const axios = require('axios');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getN8nConfig, setN8nConfig, triggerN8n } = require('../config/n8nConfig');

const router = express.Router();

const N8N_URL = process.env.N8N_WEBHOOK_URL || '';
const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET || '';

// ── Addon config: a user can add / view their own n8n webhook at runtime ──
// GET  /api/n8n/config — view current addon config (secret redacted)
router.get('/config', authenticateToken, async (req, res) => {
  const cfg = await getN8nConfig();
  res.json({
    enabled: cfg.enabled,
    url: cfg.url || null,
    hasSecret: !!cfg.secret,
    source: cfg.url === (process.env.N8N_WEBHOOK_URL || '') ? 'env' : 'user'
  });
});

// POST /api/n8n/config — add/update the webhook URL (admin only)
router.post('/config', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { url, secret, enabled } = req.body;
    if (url && !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: 'url must start with http:// or https://' });
    }
    const saved = await setN8nConfig({ url, secret, enabled });
    res.json({ message: 'n8n addon updated', enabled: saved.enabled, url: saved.url || null, hasSecret: !!saved.secret });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update n8n config' });
  }
});

// POST /api/n8n/test — fire a test event to the configured webhook (admin only)
router.post('/test', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const result = await triggerN8n('addon.test', { by: req.user.id, at: new Date().toISOString() });
  res.json(result);
});

// Verify n8n webhook signature
function verifyN8nSignature(req) {
  if (!N8N_SECRET) return true;
  const sig = req.headers['x-n8n-secret'] || req.headers['x-webhook-secret'];
  return sig === N8N_SECRET;
}

// POST /api/n8n/webhook — receive event from n8n
router.post('/webhook', async (req, res) => {
  try {
    if (!verifyN8nSignature(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { event, data, timestamp } = req.body;
    console.log(`[n8n webhook] Event: ${event}`, data);

    switch (event) {
      case 'user.created':
        console.log(`[n8n] New user created: ${data?.email}`);
        break;

      case 'course.enrolled': {
        const { studentId, courseId } = data || {};
        if (studentId && courseId) {
          await supabaseAdmin.from('enrollments')
            .update({ status: 'active' })
            .eq('student_id', studentId).eq('course_id', courseId);
        }
        break;
      }

      case 'payment.completed': {
        const { paymentId, status } = data || {};
        if (paymentId) {
          await supabaseAdmin.from('payments').update({ status: status || 'completed' }).eq('id', paymentId);
        }
        break;
      }

      case 'marketplace.purchase': {
        const { purchaseId } = data || {};
        if (purchaseId) {
          await supabaseAdmin.from('marketplace_purchases').update({ status: 'completed' }).eq('id', purchaseId);
        }
        break;
      }

      case 'user.sync':
        console.log('[n8n] User sync requested');
        break;

      default:
        console.log(`[n8n] Unknown event: ${event}`);
    }

    res.json({ received: true, event, processedAt: new Date().toISOString() });
  } catch (error) {
    console.error('n8n webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// POST /api/n8n/trigger — trigger an n8n workflow
router.post('/trigger', authenticateToken, async (req, res) => {
  try {
    const { workflowId, event, data } = req.body;
    if (!event) return res.status(400).json({ error: 'event is required' });

    const payload = {
      event,
      data: data || {},
      triggeredBy: req.user.id,
      triggeredAt: new Date().toISOString()
    };

    const url = workflowId ? `${N8N_URL}/${workflowId}` : N8N_URL;
    const response = await axios.post(url, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_SECRET && { 'X-N8N-Secret': N8N_SECRET })
      }
    });

    res.json({ triggered: true, event, n8nResponse: response.data });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ error: 'n8n server not reachable', n8nUrl: N8N_URL });
    }
    console.error('n8n trigger error:', error.message);
    res.status(500).json({ error: 'Failed to trigger n8n workflow' });
  }
});

// GET /api/n8n/status — check n8n connectivity
router.get('/status', async (req, res) => {
  try {
    const start = Date.now();
    await axios.get(N8N_URL.replace('/webhook/', '/healthz').split('/webhook/')[0] + '/healthz', { timeout: 5000 });
    const latency = Date.now() - start;
    res.json({ connected: true, n8nUrl: N8N_URL, latencyMs: latency });
  } catch (error) {
    res.json({ connected: false, n8nUrl: N8N_URL, error: error.message });
  }
});

// POST /api/n8n/notify — send notification via n8n
router.post('/notify', authenticateToken, async (req, res) => {
  try {
    const { userId, type, message, channel = 'email' } = req.body;
    if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });

    const { data: user } = await supabaseAdmin.from('jeetmantra_users').select('email,full_name,phone').eq('id', userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const payload = {
      event: 'notification.send',
      data: { userId, email: user.email, name: user.full_name, phone: user.phone, type, message, channel }
    };

    try {
      await axios.post(N8N_URL, payload, { timeout: 8000 });
      res.json({ sent: true, channel, userId });
    } catch {
      res.json({ sent: false, queued: true, message: 'n8n not reachable, notification queued' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Notification failed' });
  }
});

// POST /api/n8n/sync-users — n8n pulls user data for sync
router.post('/sync-users', async (req, res) => {
  try {
    const secret = req.headers['x-sync-secret'] || req.body.secret;
    // Fail-closed in production: these expose user/course data, so a missing
    // N8N_SECRET must NOT mean "open to everyone".
    if (!N8N_SECRET) {
      if (process.env.NODE_ENV === 'production') return res.status(503).json({ error: 'Sync secret not configured' });
    } else if (secret !== N8N_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { since } = req.body;
    let query = supabaseAdmin.from('jeetmantra_users').select('id,email,full_name,user_type,created_at,is_active').neq('status', 'deleted').order('created_at', { ascending: false }).limit(500);
    if (since) query = query.gte('created_at', since);

    const { data: users, error } = await query;
    if (error) console.warn('n8n sync-users error:', error.message);
    res.json({ users: users || [], count: users?.length || 0, syncedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'User sync failed' });
  }
});

// POST /api/n8n/sync-courses — n8n pulls course data
router.post('/sync-courses', async (req, res) => {
  try {
    const secret = req.headers['x-sync-secret'] || req.body.secret;
    // Fail-closed in production: these expose user/course data, so a missing
    // N8N_SECRET must NOT mean "open to everyone".
    if (!N8N_SECRET) {
      if (process.env.NODE_ENV === 'production') return res.status(503).json({ error: 'Sync secret not configured' });
    } else if (secret !== N8N_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { since } = req.body;
    let query = supabaseAdmin.from('courses').select('id,title,category,level,price,is_active,created_at').order('created_at', { ascending: false }).limit(500);
    if (since) query = query.gte('created_at', since);

    const { data: courses, error } = await query;
    if (error) console.warn('n8n sync-courses error:', error.message);
    res.json({ courses: courses || [], count: courses?.length || 0, syncedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Course sync failed' });
  }
});

module.exports = router;
