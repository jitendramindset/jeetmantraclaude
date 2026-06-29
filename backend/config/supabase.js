const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Some features may not work.');
}

// Fetch wrapper with a 10-second timeout so Supabase hangs don't stall the server
function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

const clientOpts = {
  auth: { persistSession: false },
  global: { fetch: fetchWithTimeout },
};

// Admin client (service role) — full DB access, bypasses RLS.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, clientOpts);

// General client — backed by service role key (self-hosted anon key is invalid).
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, clientOpts)
  : createClient(supabaseUrl, supabaseKey, clientOpts);

module.exports = { supabase, supabaseAdmin };
