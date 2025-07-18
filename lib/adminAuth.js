import { supabase } from './supabase';

export async function validateAdminSession(req) {
  try {
    // Get session token from cookie
    const cookies = req.headers.cookie;
    let sessionToken = null;

    if (cookies) {
      const cookieArray = cookies.split(';');
      const sessionCookie = cookieArray.find(cookie => cookie.trim().startsWith('admin_session='));
      if (sessionCookie) {
        sessionToken = sessionCookie.split('=')[1];
      }
    }

    if (!sessionToken) {
      return { isValid: false, admin: null };
    }

    // Try new admin_sessions table first
    try {
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .select(`
          session_id,
          admin_id,
          expires_at,
          ip_address,
          admin:admin_id (
            admin_id,
            username,
            role
          )
        `)
        .eq('session_token', sessionToken)
        .single();

      if (!sessionError && session && session.admin) {
        // Check if session hasn't expired
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        
        if (now <= expiresAt) {
          // Update last accessed time for session tracking
          await supabase
            .from('admin_sessions')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('session_id', session.session_id);

          return { 
            isValid: true, 
            admin: {
              admin_id: session.admin.admin_id,
              username: session.admin.username,
              role: session.admin.role
            }
          };
        } else {
          // Session expired, remove it from database
          await supabase
            .from('admin_sessions')
            .delete()
            .eq('session_id', session.session_id);
        }
      }
    } catch (newSystemError) {
      // New session system not available, fall back to old system
      console.log('Session system fallback activated');
    }

    // Fallback to old admin table session system
    const { data: admins, error: adminError } = await supabase
      .from('admin')
      .select('admin_id, username, role, session_data')
      .not('session_data', 'is', null);

    if (adminError || !admins || admins.length === 0) {
      return { isValid: false, admin: null };
    }

    // Find admin with matching session token
    const admin = admins.find(a => 
      a.session_data && a.session_data.token === sessionToken
    );

    if (!admin || !admin.session_data) {
      return { isValid: false, admin: null };
    }

    // Check if session hasn't expired
    const now = new Date();
    const expiresAt = new Date(admin.session_data.expires_at);
    
    if (now > expiresAt) {
      // Session expired, clear it
      await supabase
        .from('admin')
        .update({ session_data: null })
        .eq('admin_id', admin.admin_id);
      
      return { isValid: false, admin: null };
    }

    return { 
      isValid: true, 
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        role: admin.role
      }
    };

  } catch (error) {
    console.error('Session validation error:', error);
    return { isValid: false, admin: null };
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const { isValid, admin } = await validateAdminSession(req);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Add admin info to request object
    req.admin = admin;
    
    return handler(req, res);
  };
}