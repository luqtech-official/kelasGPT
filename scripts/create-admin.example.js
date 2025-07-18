// Template: Create admin user with bcrypt password
// Copy to create-admin.js and update credentials before use

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin(username, password, role = 'super_admin') {
  try {
    // Hash password with bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const { data, error } = await supabase
      .from('admin')
      .insert({
        username: username,
        password_hash: passwordHash,
        role: role,
        email: `${username}@admin.local`
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.error('❌ Admin user already exists');
      } else {
        console.error('❌ Error creating admin:', error.message);
      }
      return false;
    }

    console.log('✅ Admin user created successfully:');
    console.log(`   Username: ${data.username}`);
    console.log(`   Role: ${data.role}`);
    console.log(`   Admin ID: ${data.admin_id}`);
    return true;

  } catch (error) {
    console.error('❌ Script error:', error.message);
    return false;
  }
}

// SECURITY NOTE: Replace these with your actual credentials
async function main() {
  console.log('🔐 Creating admin user...\n');
  
  // ⚠️ CHANGE THESE CREDENTIALS BEFORE RUNNING
  const username = 'YOUR_USERNAME_HERE';
  const password = 'YOUR_SECURE_PASSWORD_HERE';
  
  if (username === 'YOUR_USERNAME_HERE' || password === 'YOUR_SECURE_PASSWORD_HERE') {
    console.error('❌ Please update the credentials in this script before running');
    console.error('   Edit the username and password variables');
    process.exit(1);
  }
  
  const success = await createAdmin(username, password);
  
  if (success) {
    console.log('\n✅ Admin creation completed successfully!');
  } else {
    console.log('\n❌ Admin creation failed');
    process.exit(1);
  }
}

main();