/**
 * JeetMantra v2.0 Database Migration
 * Adds: school/coaching roles, marketplace tables, vector search, sync queue
 * Run: node scripts/migrate-v2.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { supabaseAdmin } = require('../config/supabase');

async function run(label, sql) {
  const { error } = await supabaseAdmin.rpc('exec_sql', { sql }).single();
  if (error) {
    // Try direct approach
    console.log(`  ⚠️  ${label}: ${error.message}`);
    return false;
  }
  console.log(`  ✅ ${label}`);
  return true;
}

async function migrate() {
  console.log('\n🔧 JeetMantra v2.0 Database Migration\n');

  // Step 1: Update user_type constraint to include school and coaching
  console.log('📋 Step 1: Updating user_type constraint...');
  const { error: e1 } = await supabaseAdmin
    .from('jeetmantra_users')
    .select('id')
    .in('user_type', ['school', 'coaching'])
    .limit(1);

  if (e1) {
    console.log('  ⚠️  Cannot check user_type constraint:', e1.message);
    console.log('  📝 Run this SQL in your Supabase dashboard SQL editor:');
    console.log(`
  -- 1. Update user_type constraint to allow school and coaching
  ALTER TABLE jeetmantra_users
    DROP CONSTRAINT IF EXISTS jeetmantra_users_user_type_check;

  ALTER TABLE jeetmantra_users
    ADD CONSTRAINT jeetmantra_users_user_type_check
    CHECK (user_type IN ('student', 'teacher', 'partner', 'admin', 'school', 'coaching'));

  -- 2. Create marketplace_listings table
  CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    course_id UUID,
    price DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed')),
    views INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(seller_id, course_id)
  );

  -- 3. Create marketplace_purchases table
  CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL,
    listing_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    seller_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- 4. Create school_profiles table
  CREATE TABLE IF NOT EXISTS school_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    school_name VARCHAR(255) NOT NULL,
    affiliation VARCHAR(255),
    student_count INTEGER DEFAULT 0,
    teacher_count INTEGER DEFAULT 0,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- 5. Create coaching_profiles table
  CREATE TABLE IF NOT EXISTS coaching_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    center_name VARCHAR(255) NOT NULL,
    specializations TEXT[] DEFAULT '{}',
    student_capacity INTEGER DEFAULT 0,
    batch_count INTEGER DEFAULT 0,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- 6. Add courses table if not exists
  CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    level VARCHAR(50) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    price DECIMAL(10,2) DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    max_students INTEGER DEFAULT 30,
    batch_timing VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_live BOOLEAN DEFAULT false,
    cover_image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- 7. Add earnings table if not exists
  CREATE TABLE IF NOT EXISTS earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    source VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);
  } else {
    console.log('  ✅ jeetmantra_users table accessible');
  }

  // Step 2: Test table existence
  console.log('\n📋 Step 2: Checking table status...');
  const tables = ['marketplace_listings', 'marketplace_purchases', 'school_profiles', 'coaching_profiles', 'courses', 'earnings'];
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).select('*').limit(0);
    if (error) {
      console.log(`  ❌ ${table} — NOT FOUND (${error.message.slice(0, 60)})`);
    } else {
      console.log(`  ✅ ${table} — exists`);
    }
  }

  // Step 3: Try to insert a test school user to verify constraint
  console.log('\n📋 Step 3: Testing school/coaching role constraint...');
  const testId = '00000000-0000-0000-0000-000000000001';
  const { error: schoolError } = await supabaseAdmin
    .from('jeetmantra_users')
    .upsert({ id: testId, email: 'migtest@jm.local', full_name: 'Mig Test', user_type: 'school', password_hash: 'test' })
    .select().single();

  if (schoolError) {
    console.log('  ❌ school role NOT allowed in DB:', schoolError.message.slice(0, 100));
    console.log('  📝 You MUST run the ALTER TABLE SQL above in Supabase SQL editor');
  } else {
    console.log('  ✅ school role allowed in DB');
    // Clean up test record
    await supabaseAdmin.from('jeetmantra_users').delete().eq('id', testId);
  }

  console.log('\n📝 Migration Summary:');
  console.log('   1. Open your Supabase project dashboard');
  console.log('   2. Go to SQL Editor');
  console.log('   3. Run the SQL shown above');
  console.log('   4. Re-run tests: node scripts/test-e2e.js\n');
}

migrate().catch(e => console.error('Migration error:', e.message));
