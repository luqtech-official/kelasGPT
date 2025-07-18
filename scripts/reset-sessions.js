// Reset all sessions for clean production deployment
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAllSessions() {
  try {
    console.log('🧹 Resetting all sessions for clean deployment...\n');

    // Clear all sessions from new table
    const { data: deletedSessions, error: deleteError } = await supabase
      .from('admin_sessions')
      .delete()
      .neq('session_id', '00000000-0000-0000-0000-000000000000') // Delete all
      .select('session_id');

    if (deleteError) {
      console.error('❌ Error clearing admin_sessions:', deleteError.message);
    } else {
      console.log(`✅ Cleared ${deletedSessions?.length || 0} sessions from admin_sessions table`);
    }

    // Clear any old session data from admin table (if column exists)
    try {
      const { error: clearOldError } = await supabase
        .from('admin')
        .update({ session_data: null })
        .not('session_data', 'is', null);

      if (!clearOldError) {
        console.log('✅ Cleared old session data from admin table');
      }
    } catch (e) {
      console.log('ℹ️  No old session data to clear (expected)');
    }

    console.log('\n🎉 All sessions cleared! Both dev and production will need to login fresh.');

  } catch (error) {
    console.error('❌ Session reset error:', error.message);
  }
}

resetAllSessions();