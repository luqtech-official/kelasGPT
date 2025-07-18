// Check production database state
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductionDatabase() {
  try {
    console.log('🔍 Checking production database state...\n');

    // Check if admin_sessions table exists
    console.log('1. Checking admin_sessions table...');
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('session_id')
        .limit(1);
      
      if (error) {
        console.log('❌ admin_sessions table does NOT exist');
        console.log('   Error:', error.message);
      } else {
        console.log('✅ admin_sessions table exists');
        console.log(`   Contains ${data?.length || 0} sessions`);
      }
    } catch (e) {
      console.log('❌ admin_sessions table access failed:', e.message);
    }

    // Check admin table
    console.log('\n2. Checking admin table...');
    try {
      const { data: admins, error: adminError } = await supabase
        .from('admin')
        .select('admin_id, username, role')
        .limit(5);
      
      if (adminError) {
        console.log('❌ Cannot access admin table:', adminError.message);
      } else {
        console.log('✅ admin table accessible');
        console.log(`   Contains ${admins?.length || 0} admin users`);
        admins?.forEach(admin => {
          console.log(`   - ${admin.username} (${admin.role})`);
        });
      }
    } catch (e) {
      console.log('❌ admin table access failed:', e.message);
    }

    // Check for any existing sessions in old format
    console.log('\n3. Checking for old session data...');
    try {
      const { data: sessionsData, error: sessionError } = await supabase
        .from('admin')
        .select('username, session_data')
        .not('session_data', 'is', null);
      
      if (sessionError) {
        console.log('❌ Cannot check session data:', sessionError.message);
      } else {
        console.log(`✅ Found ${sessionsData?.length || 0} admins with old session data`);
        sessionsData?.forEach(admin => {
          console.log(`   - ${admin.username}: has session data`);
        });
      }
    } catch (e) {
      console.log('❌ Session data check failed:', e.message);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkProductionDatabase();