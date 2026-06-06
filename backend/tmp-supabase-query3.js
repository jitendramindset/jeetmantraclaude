const { createClient } = require('@supabase/supabase-js');
const url = 'https://api.mantravat.cloud';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjgxNDQxMjIsImV4cCI6MTkyNTgyNDEyMn0.j9XEBLD9SdKvEhSsRsluA52y_jXTdSjoedzoND5xVOQ';
const supabase = createClient(url, key);

(async () => {
  try {
    const { data, error } = await supabase.from('jeetmantra_users').select('id,email,full_name,role,user_type,mobile,auth_method').limit(200);
    if (error) {
      console.error('ERROR', JSON.stringify(error, null, 2));
      process.exit(1);
    }
    const uniqueRoles = [...new Set(data.map(u => u.role).filter(Boolean))];
    const uniqueTypes = [...new Set(data.map(u => u.user_type).filter(Boolean))];
    console.log('roles:', uniqueRoles);
    console.log('user_types:', uniqueTypes);
    console.log('total:', data.length);
    console.log(JSON.stringify(data.filter(u => u.role || u.user_type), null, 2));
  } catch (e) {
    console.error('EX', e);
    process.exit(1);
  }
})();
