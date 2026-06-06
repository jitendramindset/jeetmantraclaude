const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Some features may not work.');
}

// Admin client (service role) — full DB access, bypasses RLS.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// "supabase" is the general client used by routes for reads/writes.
// NOTE: this self-hosted instance rejects the anon key ("Invalid authentication
// credentials"), and the backend is itself the trusted gateway — it enforces
// JWT auth + role checks via middleware on every route. So we back this client
// with the service role key too, which makes all existing supabase.from(...)
// calls work. If you later expose Supabase directly to browsers with RLS, give
// this its own anon/user-scoped client instead.
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient(supabaseUrl, supabaseKey);

module.exports = {
  supabase,
  supabaseAdmin
};
