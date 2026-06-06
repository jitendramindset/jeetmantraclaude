const { createClient } = require('@supabase/supabase-js');
const url = 'https://api.mantravat.cloud';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjgxNDQxMjIsImV4cCI6MTkyNTgyNDEyMn0.j9XEBLD9SdKvEhSsRsluA52y_jXTdSjoedzoND5xVOQ';
const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase.from('jeetmantra_users').select('id,email,full_name,role,user_type,mobile,auth_method').limit(200);
    if (error) { console.error('ERROR', JSON.stringify(error, null, 2)); process.exit(1); }
    const filtered = data.filter(u => u.email?.match(/teacher|partner|student|admin/i) || u.full_name?.match(/teacher|partner|student|admin/i) || u.role?.match(/teacher|partner|student|admin/i) || u.user_type?.match(/teacher|partner|student|admin/i));
    console.log(JSON.stringify(filtered, null, 2));
  } catch (e) {
    console.error('EX', e);
    process.exit(1);
  }
})();
