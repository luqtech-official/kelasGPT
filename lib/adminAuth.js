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

    // Validate session in database
    const { data: admin, error } = await supabase
      .from('admin')
      .select('admin_id, username, role, session_data')
      .not('session_data', 'is', null)
      .single();

    if (error || !admin || !admin.session_data) {
      return { isValid: false, admin: null };
    }

    // Check if session token matches and hasn't expired
    const sessionData = admin.session_data;
    if (sessionData.token !== sessionToken) {
      return { isValid: false, admin: null };
    }

    const now = new Date();
    const expiresAt = new Date(sessionData.expires_at);
    
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