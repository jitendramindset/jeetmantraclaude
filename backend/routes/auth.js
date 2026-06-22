const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { mintToken, provisionPersonalInstitute, ensureRoleRow } = require('../services/identity');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// OTP storage — uses Supabase table jeetmantra_otps (phone, otp_hash, expiry,
// created_at). Falls back to in-memory if the table doesn't exist yet.
const otpStore = {}; // in-memory fallback
let _otpTableReady = null; // lazy check
async function _ensureOtpTable() {
  if (_otpTableReady !== null) return _otpTableReady;
  try {
    const { error } = await supabaseAdmin.from('jeetmantra_otps').select('phone').limit(1);
    _otpTableReady = !error;
  } catch (e) { _otpTableReady = false; }
  return _otpTableReady;
}
async function storeOtp(phone, otp) {
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  if (await _ensureOtpTable()) {
    await supabaseAdmin.from('jeetmantra_otps').upsert({ phone, otp_hash: hash, expiry, created_at: new Date().toISOString() }, { onConflict: 'phone' });
  } else {
    otpStore[phone] = { otp, expiry: Date.now() + 10 * 60 * 1000 };
  }
}
// Force-delete a stored OTP (used after too many failed attempts).
async function invalidateOtp(phone) {
  if (await _ensureOtpTable()) {
    await supabaseAdmin.from('jeetmantra_otps').delete().eq('phone', phone);
  } else {
    delete otpStore[phone];
  }
}
async function verifyAndClearOtp(phone, otp) {
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  if (await _ensureOtpTable()) {
    const { data } = await supabaseAdmin.from('jeetmantra_otps').select('*').eq('phone', phone).maybeSingle();
    if (!data) return { valid: false, error: 'OTP not sent or expired' };
    if (data.otp_hash !== hash) return { valid: false, error: 'Invalid OTP' };
    if (new Date(data.expiry) < new Date()) {
      await supabaseAdmin.from('jeetmantra_otps').delete().eq('phone', phone);
      return { valid: false, error: 'OTP expired. Request new OTP' };
    }
    await supabaseAdmin.from('jeetmantra_otps').delete().eq('phone', phone);
    return { valid: true };
  }
  // Fallback to in-memory
  const stored = otpStore[phone];
  if (!stored) return { valid: false, error: 'OTP not sent or expired' };
  if (stored.otp !== otp) return { valid: false, error: 'Invalid OTP' };
  if (Date.now() > stored.expiry) { delete otpStore[phone]; return { valid: false, error: 'OTP expired. Request new OTP' }; }
  delete otpStore[phone];
  return { valid: true };
}

// ── Brute-force guard. Keys by IP+email; locks 15 minutes after 6 failed
// login attempts. Uses in-memory Map (fast, single-node). For multi-node
// deployments, swap for Redis or a DB table. The in-memory store is acceptable
// for single-server setups — restarts reset counts (fail-open, not fail-closed).
const _attempts = new Map();
const LOCK_AFTER = 6, LOCK_MINUTES = 15, WINDOW_MINUTES = 15;
function _key(req, email) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  return ip + '|' + String(email || '').toLowerCase();
}
function loginThrottle(req, res, next) {
  const k = _key(req, req.body?.email);
  const now = Date.now();
  const rec = _attempts.get(k);
  if (rec && rec.lockedUntil && rec.lockedUntil > now) {
    const mins = Math.ceil((rec.lockedUntil - now) / 60000);
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${mins} min.` });
  }
  // Cheap GC — drop entries older than window.
  if (rec && now - rec.firstAt > WINDOW_MINUTES * 60000) _attempts.delete(k);
  next();
}
function loginRecordFail(req) {
  const k = _key(req, req.body?.email);
  const now = Date.now();
  const rec = _attempts.get(k) || { count: 0, firstAt: now, lockedUntil: 0 };
  rec.count++;
  if (rec.count >= LOCK_AFTER) rec.lockedUntil = now + LOCK_MINUTES * 60000;
  _attempts.set(k, rec);
}
function loginRecordSuccess(req) {
  _attempts.delete(_key(req, req.body?.email));
}

// Simple per-IP rate limit for /signup + /forgot-password — 10 / hour.
const _ipHits = new Map();
function ipLimit(perHour) {
  return (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    const now = Date.now(), hourAgo = now - 60 * 60000;
    const arr = (_ipHits.get(ip) || []).filter(t => t > hourAgo);
    if (arr.length >= perHour) return res.status(429).json({ error: 'Rate limited. Try again later.' });
    arr.push(now); _ipHits.set(ip, arr); next();
  };
}

// Per-phone OTP rate limit — 5 OTP sends per phone per hour (closes B3).
// Stacked with ipLimit so both IP and phone must be under threshold.
const _phoneSendHits = new Map();
function phoneLimit(perHour) {
  return (req, res, next) => {
    const raw = String(req.body?.phone || '').replace(/\D/g, '');
    const phone = raw.length >= 10 ? raw.slice(-10) : raw;
    if (!phone) return next(); // invalid phone caught by validation below
    const now = Date.now(), hourAgo = now - 60 * 60000;
    const arr = (_phoneSendHits.get(phone) || []).filter(t => t > hourAgo);
    if (arr.length >= perHour) {
      return res.status(429).json({ error: 'Too many OTP requests for this number. Try again in 1 hour.' });
    }
    arr.push(now); _phoneSendHits.set(phone, arr); next();
  };
}

// Per-phone failed-OTP attempt cap. A 6-digit OTP with no cap is brute-forceable
// (the stored OTP isn't cleared on a wrong guess), so we count failures and
// invalidate the OTP after OTP_MAX_FAILS wrong tries, forcing a re-request.
const _otpFails = new Map();
const OTP_MAX_FAILS = 5;
function otpRecordFail(phone) {
  const n = (_otpFails.get(phone) || 0) + 1;
  _otpFails.set(phone, n);
  return n;
}
function otpClearFails(phone) { _otpFails.delete(phone); }

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SMS. Real delivery when a provider is configured, else logs to
// console (dev). Two providers, checked in order:
//   1. SMS_WEBHOOK_URL  — POST {phone, otp, message} (works great with n8n).
//   2. Twilio           — TWILIO_SID / TWILIO_TOKEN / TWILIO_FROM (REST, no SDK).
async function sendOTP(phone, otp) {
  const msg = `Your JeetMantra OTP is ${otp}. Valid 10 minutes. Do not share it.`;
  const to = phone.startsWith('+') ? phone : '+91' + phone.replace(/\D/g, '').slice(-10);
  // Config from admin settings (platform_settings) first, then .env.
  const smsWebhook = await getSetting('sms_webhook_url', 'SMS_WEBHOOK_URL');
  const twSid = await getSetting('twilio_sid', 'TWILIO_SID');
  try {
    if (smsWebhook) {
      const axios = require('axios');
      const secret = await getSetting('sms_webhook_secret', 'SMS_WEBHOOK_SECRET');
      await axios.post(smsWebhook, { phone: to, otp, message: msg },
        { headers: secret ? { 'x-sms-secret': secret } : {}, timeout: 8000 });
      console.log(`📱 OTP sent to ${to} via SMS webhook`);
      return { sent: true, mode: 'webhook' };
    }
    const twToken = await getSetting('twilio_token', 'TWILIO_TOKEN');
    const twFrom = await getSetting('twilio_from', 'TWILIO_FROM');
    if (twSid && twToken && twFrom) {
      const axios = require('axios');
      await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${twSid}/Messages.json`,
        new URLSearchParams({ To: to, From: twFrom, Body: msg }).toString(),
        { auth: { username: twSid, password: twToken }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 });
      console.log(`📱 OTP sent to ${to} via Twilio`);
      return { sent: true, mode: 'twilio' };
    }
  } catch (e) { console.error('[sms] send failed:', e.response?.data || e.message); return { sent: false, mode: 'error', error: e.message }; }
  console.log(`📱 [console-only — no SMS provider configured] OTP for ${to}: ${otp}`);
  return { sent: false, mode: 'console' };
}

// Sign up
router.post('/signup', ipLimit(10), validate('signup'), async (req, res) => {
  try {
    const { email, password, fullName, role, phone, aiProvider, apiKey } = req.validatedData;

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password (bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Map the AI provider + key (chosen at signup) onto the account, encrypted.
    const userRow = {
      id: uuidv4(),
      email,
      password_hash: hashedPassword,
      full_name: fullName,
      user_type: role,
      phone,
      created_at: new Date().toISOString()
    };
    if (aiProvider && apiKey && apiKey.trim()) {
      try {
        const { encrypt } = require('../config/aiProvider');
        userRow.ai_provider = aiProvider === 'claude' ? 'anthropic' : aiProvider;
        userRow.api_key_encrypted = encrypt(apiKey.trim());
      } catch (e) { console.warn('signup AI key encrypt failed:', e.message); }
    }

    // Create user using the remote schema fields
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('jeetmantra_users')
      .insert(userRow)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Create role-specific profile (best-effort — don't fail signup if it errors)
    try {
      const v = req.validatedData;
      const toInt = (x) => (x === '' || x === undefined || x === null ? undefined : parseInt(x, 10));
      if (role === 'school') {
        await supabaseAdmin.from('school_profiles').insert({
          id: uuidv4(),
          user_id: newUser.id,
          school_name: v.schoolName || fullName,
          affiliation: v.affiliationBoard || v.affiliation || null,
          student_count: toInt(v.studentCount) || 0,
          teacher_count: toInt(v.teacherCount) || 0,
          contact_email: email,
          contact_phone: phone || null,
          address: v.address || null,
          created_at: new Date().toISOString()
        });
      } else if (role === 'coaching') {
        const specs = Array.isArray(v.specializations)
          ? v.specializations
          : (v.specializations ? String(v.specializations).split(',').map(s => s.trim()).filter(Boolean) : []);
        await supabaseAdmin.from('coaching_profiles').insert({
          id: uuidv4(),
          user_id: newUser.id,
          center_name: v.centerName || fullName,
          specializations: specs,
          student_capacity: toInt(v.studentCapacity) || 0,
          batch_count: toInt(v.batchCount) || 0,
          contact_email: email,
          contact_phone: phone || null,
          address: v.address || null,
          created_at: new Date().toISOString()
        });
      }
    } catch (profileErr) {
      console.warn('Profile creation warning:', profileErr.message);
    }

    // Sprint 2 identity work: mirror the user_type into the new user_roles
    // table, and for creator roles auto-provision a "personal institute" so
    // every course they create can be institution-scoped from day one (no
    // null-institution legacy path).
    await ensureRoleRow(newUser.id, newUser.user_type || role, null);
    await provisionPersonalInstitute(newUser.id, newUser.user_type || role);

    const token = await mintToken(newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.user_type || role
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', loginThrottle, validate('login'), async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Get user by email
    const { data: user, error } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*')
      .eq('email', email)
      .single();

    // Distinguish "no such user" (PGRST116 = zero rows, a legitimate 401) from a
    // real DB/connection error (bad service key, RLS, schema) which must NOT be
    // masked as a bad-password 401 — that makes valid logins look broken.
    if (error && error.code !== 'PGRST116') {
      console.error('Login DB error:', error.code, error.message);
      return res.status(500).json({ error: 'Login temporarily unavailable. Please try again.' });
    }

    if (!user) {
      loginRecordFail(req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password: prefer bcrypt, fallback to legacy SHA-256 pass_hash
    let validPassword = false;
    if (user.password_hash) {
      validPassword = await bcrypt.compare(password, user.password_hash);
    }

    if (!validPassword && (user.pass_hash || user.password)) {
      const legacyHash = user.pass_hash || user.password;
      const candidate = crypto.createHash('sha256').update(password).digest('hex');
      if (candidate === legacyHash) {
        validPassword = true;
        // Migrate: store bcrypt hash for future
        try {
          const newHash = await bcrypt.hash(password, 10);
          await supabaseAdmin
            .from('jeetmantra_users')
            .update({ password_hash: newHash })
            .eq('id', user.id);
        } catch (e) {
          console.warn('Password migration failed for user', user.id, e.message);
        }
      }
    }

    if (!validPassword) {
      loginRecordFail(req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    loginRecordSuccess(req);

    // JWT now carries role + roles[] — older clients reading .role continue to
    // work; multi-role gating reads the union via authorizeRole.
    const token = await mintToken(user);

    // Update last login if supported by schema
    try {
      await supabaseAdmin
        .from('jeetmantra_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    } catch (updateError) {
      console.warn('Could not update last_login for user', user.id, updateError.message);
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.user_type || user.role,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

// Refresh token — re-issues with the CURRENT role union (so a role granted
// since the previous token was minted shows up after a refresh).
router.post('/refresh', authenticateToken, async (req, res) => {
  const token = await mintToken({ id: req.user.id, email: req.user.email, role: req.user.role });
  res.json({ message: 'Token refreshed', token });
});

// GET /auth/config — public endpoint exposing front-end auth configuration.
// Returns GOOGLE_CLIENT_ID so login.html can init GSI without hardcoding it.
router.get('/config', (req, res) => {
  res.json({
    google_client_id: process.env.GOOGLE_CLIENT_ID || '',
    otp_enabled: true,
    email_login: true,
  });
});

// POST /auth/google-login — verifies a Google ID-token credential issued by
// Google Identity Services (GSI One Tap / Sign In With Google). The frontend
// sends { credential: "<id_token>" }; we verify it server-side with
// google-auth-library so the email/identity cannot be spoofed.
router.post('/google-login', ipLimit(20), async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential (ID token) required' });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(503).json({ error: 'Google login not configured on this server (set GOOGLE_CLIENT_ID)' });

    const { OAuth2Client } = require('google-auth-library');
    const gClient = new OAuth2Client(clientId);
    let payload;
    try {
      const ticket = await gClient.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({ error: 'Invalid or expired Google credential' });
    }

    const { email, name: fullName, sub: googleId, picture: profileImage, email_verified } = payload;
    if (!email_verified) return res.status(400).json({ error: 'Google account email is not verified' });

    // Find or create user — Google login always provisions as student on first sign-up.
    const role = 'student';
    let { data: user } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      const newUserId = uuidv4();
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('jeetmantra_users')
        .insert({
          id: newUserId,
          email,
          full_name: fullName || email.split('@')[0],
          user_type: role,
          email_verified: true,
          password_hash: 'google_auth',
          profile_image: profileImage || null,
          google_id: googleId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) return res.status(500).json({ error: 'Failed to create user' });

      user = newUser;
      await ensureRoleRow(user.id, role, null);
      await provisionPersonalInstitute(user.id, role);
    } else {
      // Mark email verified + store google_id if not already
      const updates = {};
      if (!user.email_verified) updates.email_verified = true;
      if (!user.google_id)      updates.google_id = googleId;
      if (Object.keys(updates).length) {
        await supabaseAdmin.from('jeetmantra_users').update(updates).eq('id', user.id);
      }
    }

    const token = await mintToken(user);
    res.json({
      message: 'Google login successful',
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.user_type || user.role },
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Send OTP to Phone — dual rate-limit: 8/hr per IP + 5/hr per phone number.
router.post('/send-otp', ipLimit(8), phoneLimit(5), async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid phone number required' });
    }
    // Fresh OTP resets the failed-attempt counter for this phone.
    otpClearFails(phone);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (DB-backed with hash, falls back to in-memory)
    await storeOtp(phone, otp);

    // Deliver via configured SMS provider (webhook/Twilio), else console (dev).
    const smsResult = await sendOTP(phone, otp);

    res.json({
      message: 'OTP sent successfully',
      phone: phone.slice(-4), // Return last 4 digits for security
      expiresIn: 600, // 10 minutes
      // In non-production with no SMS provider, surface the delivery mode so the
      // tester knows to read the OTP from the server console.
      ...(process.env.NODE_ENV !== 'production' ? { _delivery: smsResult.mode } : {})
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and Login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, fullName, role = 'student' } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // Check OTP validity (DB-backed with hash)
    const otpResult = await verifyAndClearOtp(phone, otp);
    if (!otpResult.valid) {
      // Count the failure; after too many wrong guesses, invalidate the stored
      // OTP so it can't be brute-forced — the user must request a new one.
      const fails = otpRecordFail(phone);
      if (fails >= OTP_MAX_FAILS) {
        try { await invalidateOtp(phone); } catch (e) {}
        otpClearFails(phone);
        return res.status(429).json({ error: 'Too many incorrect attempts. Request a new OTP.' });
      }
      return res.status(400).json({ error: otpResult.error });
    }
    otpClearFails(phone);

    // Check if user exists with this phone
    let { data: user } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*')
      .eq('phone', phone)
      .single();

    // If user doesn't exist, create new user
    if (!user) {
      const newUserId = uuidv4();
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('jeetmantra_users')
        .insert({
          id: newUserId,
          email: `${phone}@jeetmantra.phone`, // Temporary email
          full_name: fullName || `User_${phone.slice(-4)}`,
          phone,
          user_type: role,
          email_verified: true,
          password_hash: 'phone_auth', // Not used for phone auth
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      user = newUser;
      // First OTP signup → mirror role + auto-provision personal institute.
      await ensureRoleRow(user.id, user.user_type || role, null);
      await provisionPersonalInstitute(user.id, user.user_type || role);
    }

    const token = await mintToken(user);

    res.json({
      message: 'OTP verified and login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.user_type || user.role
      },
      token
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// ── Helper: issue + persist a single-use token for password reset / email
// verify. Returns the random hex string the user clicks in their email.
async function issueToken(userId, purpose, ttlMinutes) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  await supabaseAdmin.from('auth_tokens').insert({
    token, user_id: userId, purpose, expires_at: expires
  });
  return token;
}

// Mailer — real SMTP (Gmail/SES/etc.) when configured, else logs to console so
// dev works without credentials. Configure via SMTP_* env (see .env.example):
//   SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=you@gmail.com
//   SMTP_PASS=<gmail app password> SMTP_FROM="JeetMantra <you@gmail.com>"
const { getSetting } = require('../services/settings');
const { sendMail } = require('../services/mailer');

// ── PASSWORD RESET ─────────────────────────────────────────────────────
// POST /api/auth/forgot-password { email } — always returns 200 even when the
// email isn't registered (don't leak account existence). When the user does
// exist, we email them a link with a single-use token good for 60 minutes.
router.post('/forgot-password', ipLimit(10), async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    const { data: user } = await supabaseAdmin
      .from('jeetmantra_users').select('id, full_name').eq('email', email).maybeSingle();
    if (user) {
      const token = await issueToken(user.id, 'password_reset', 60);
      const base = process.env.FRONTEND_URL || ('http://localhost:' + (process.env.PORT || 5050));
      const link = `${base}/reset-password.html?token=${token}`;
      await sendMail(email, 'Reset your JeetMantra password',
        `Hi ${user.full_name || ''},\n\nClick to reset (valid for 60 minutes):\n${link}\n\nIf you didn't ask for this, ignore this email.`);
    }
    // Uniform response regardless of existence.
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (e) {
    console.error('forgot-password error', e);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// POST /api/auth/reset-password { token, password }
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: 'token + password required' });
    if (String(password).length < 8) return res.status(400).json({ error: 'Password must be ≥8 chars' });
    const { data: row } = await supabaseAdmin.from('auth_tokens')
      .select('*').eq('token', token).eq('purpose', 'password_reset').maybeSingle();
    if (!row) return res.status(400).json({ error: 'Invalid token' });
    if (row.used_at) return res.status(400).json({ error: 'Token already used' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });

    const password_hash = await bcrypt.hash(password, 10);
    await supabaseAdmin.from('jeetmantra_users').update({ password_hash }).eq('id', row.user_id);
    await supabaseAdmin.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('token', token);
    res.json({ message: 'Password updated. You can log in now.' });
  } catch (e) {
    console.error('reset-password error', e);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// ── EMAIL VERIFICATION ────────────────────────────────────────────────
// POST /api/auth/send-verify-email — for the logged-in user (or unauth via email param)
router.post('/send-verify-email', async (req, res) => {
  try {
    // Accept either an authenticated user OR an explicit email param (useful
    // immediately after signup before they have a token).
    let userId = null, email = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
        userId = decoded.id || decoded.userId;
      } catch (e) { /* token invalid/expired — non-fatal, proceed unauthenticated */ }
    }
    if (!userId && req.body?.email) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, email').eq('email', req.body.email).maybeSingle();
      if (data) { userId = data.id; email = data.email; }
    } else if (userId) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('email').eq('id', userId).single();
      email = data?.email;
    }
    if (!userId || !email) return res.json({ message: 'If that account exists, a verification email has been sent.' });

    const token = await issueToken(userId, 'email_verify', 60 * 24); // 24h
    const base = process.env.FRONTEND_URL || ('http://localhost:' + (process.env.PORT || 5050));
    await sendMail(email, 'Verify your JeetMantra email',
      `Click to verify (valid 24h):\n${base}/verify-email.html?token=${token}`);
    res.json({ message: 'Verification email sent.' });
  } catch (e) {
    res.status(500).json({ error: 'Send failed' });
  }
});

// GET /api/auth/verify-email?token=…  (called by the link in the email)
router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: 'token required' });
    const { data: row } = await supabaseAdmin.from('auth_tokens')
      .select('*').eq('token', token).eq('purpose', 'email_verify').maybeSingle();
    if (!row) return res.status(400).json({ error: 'Invalid token' });
    if (row.used_at) return res.status(400).json({ error: 'Token already used' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });
    await supabaseAdmin.from('jeetmantra_users').update({ email_verified: true }).eq('id', row.user_id);
    await supabaseAdmin.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('token', token);
    res.json({ message: 'Email verified.' });
  } catch (e) {
    res.status(500).json({ error: 'Verify failed' });
  }
});

module.exports = router;
