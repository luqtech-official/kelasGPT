// Template: Cleanup expired sessions script
// Copy to cleanup-sessions.js if needed
// Run periodically to clean up expired sessions

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupExpiredSessions() {
  try {
    console.log('🧹 Cleaning up expired sessions...');
    
    const now = new Date().toISOString();
    
    // Remove expired sessions from new table
    const { data: deletedSessions, error: deleteError } = await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', now)
      .select('session_id');

    if (deleteError) {
      console.error('❌ Error cleaning admin_sessions:', deleteError.message);
    } else {
      console.log(`✅ Cleaned ${deletedSessions?.length || 0} expired sessions from admin_sessions`);
    }

    console.log('🎉 Session cleanup completed');

  } catch (error) {
    console.error('❌ Session cleanup error:', error.message);
  }
}

// Run cleanup
cleanupExpiredSessions();