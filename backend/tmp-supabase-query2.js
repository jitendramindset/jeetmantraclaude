const { createClient } = require('@supabase/supabase-js');
const url = 'https://api.mantravat.cloud';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjgxNDQxMjIsImV4cCI6MTkyNTgyNDEyMn0.j9XEBLD9SdKvEhSsRsluA52y_jXTdSjoedzoND5xVOQ';
const supabase = createClient(url, key);

(async () => {
  try {
    const { data, error } = await supabase.from('jeetmantra_users').select('id,email,full_name,user_type,role,password,pass_hash,mobile,auth_method').limit(200);
    if (error) {
      console.error('ERROR', JSON.stringify(error, null, 2));
      process.exit(1);
    }
    const filtered = data.filter(u => u.user_type || u.role || (u.email && /admin|teacher|student|partner/i.test(u.email)));
    console.log(JSON.stringify(filtered, null, 2));
  } catch (e) {
    console.error('EX', e);
    process.exit(1);
  }
})();
