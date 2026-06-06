const { createClient } = require('@supabase/supabase-js');

const url = 'https://api.mantravat.cloud';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjgxNDQxMjIsImV4cCI6MTkyNTgyNDEyMn0.j9XEBLD9SdKvEhSsRsluA52y_jXTdSjoedzoND5xVOQ';
const supabase = createClient(url, key);

(async () => {
  try {
    const { data, error } = await supabase
      .from('jeetmantra_users')
      .select('id, email, role, phone, full_name')
      .limit(200);

    if (error) {
      console.error('ERROR', error);
      process.exit(1);
    }

    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('EX', e);
    process.exit(1);
  }
})();
