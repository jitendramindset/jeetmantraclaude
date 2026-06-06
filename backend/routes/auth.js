const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = {};

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (mock - in production use Twilio or AWS SNS)
function sendOTP(phone, otp) {
  console.log(`📱 OTP for ${phone}: ${otp}`);
  // In production: await twilioClient.messages.create({...});
  return true;
}

// Sign up
router.post('/signup', validate('signup'), async (req, res) => {
  try {
    const { email, password, fullName, role, phone } = req.validatedData;

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

    // Create user using the remote schema fields
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('jeetmantra_users')
      .insert({
        id: uuidv4(),
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        user_type: role,
        phone,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.user_type || role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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
router.post('/login', validate('login'), async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Get user by email
    const { data: user, error } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.user_type || user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  const token = jwt.sign(
    { 
      id: req.user.id, 
      email: req.user.email, 
      role: req.user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Token refreshed',
    token
  });
});

// Google OAuth Login
router.post('/google-login', async (req, res) => {
  try {
    const { email, fullName, googleId, profileImage, role = 'student' } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID required' });
    }

    // Check if user exists
    let { data: user } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*')
      .eq('email', email)
      .single();

    // If user doesn't exist, create new user
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
          password_hash: 'google_auth', // Not used for Google auth
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      user = newUser;
    } else {
      // Existing user: keep verification status current
      if (!user.email_verified) {
        await supabaseAdmin
          .from('jeetmantra_users')
          .update({ email_verified: true })
          .eq('id', user.id);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.user_type || user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Google login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.user_type || user.role
      },
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Send OTP to Phone
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid phone number required' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP temporarily
    otpStore[phone] = { otp, expiry: otpExpiry };

    // Send OTP (mock - in production use Twilio)
    sendOTP(phone, otp);

    console.log(`✅ OTP sent to ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      phone: phone.slice(-4), // Return last 4 digits for security
      expiresIn: 600 // 10 minutes
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

    // Check OTP validity
    const storedData = otpStore[phone];
    if (!storedData) {
      return res.status(400).json({ error: 'OTP not sent or expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (Date.now() > storedData.expiry) {
      delete otpStore[phone];
      return res.status(400).json({ error: 'OTP expired. Request new OTP' });
    }

    // Clear OTP
    delete otpStore[phone];

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
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.user_type || user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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

module.exports = router;
