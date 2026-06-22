'use strict';

// Minimal env so modules that read process.env at require-time don't crash.
process.env.NODE_ENV    = 'test';
process.env.JWT_SECRET  = 'test-secret-32-chars-long-enough!';
process.env.SUPABASE_URL          = 'https://fake.supabase.local';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-role-key';
process.env.SUPABASE_ANON_KEY     = 'fake-anon-key';
process.env.RAZORPAY_KEY_SECRET   = 'fake-rzp-secret';
process.env.SMTP_HOST             = 'localhost';
process.env.SMTP_USER             = 'test@test.com';
process.env.SMTP_PASS             = 'test';
process.env.N8N_SECRET            = 'test-n8n-secret';
process.env.RATE_LIMIT_GLOBAL     = '1000';
process.env.RATE_LIMIT_STRICT     = '1000';
