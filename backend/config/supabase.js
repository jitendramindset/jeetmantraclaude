const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not configured. Some features may not work.');
}

// Client for authenticated users
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (use service role key for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = {
  supabase,
  supabaseAdmin
};
