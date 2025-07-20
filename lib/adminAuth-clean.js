import { supabase } from './supabase';
import crypto from 'crypto';

export async function validateAdminSession(req) {
  try {
    // Get session token from cookie
    const cookies = req.headers.cookie;
    let sessionToken = null;

    if (cookies) {
      const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('admin_session='));
      if (sessionCookie) {
        sessionToken = sessionCookie.split('=')[1];
      }
    }

    if (!sessionToken) {
      return { isValid: false, admin: null };
    }

    // Check session in new admin_sessions table first  
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select(`
        session_id,
        admin_id,
        expires_at,
        admin:admin_id (
          admin_id,
          username,
          role
        )
      `)
      .eq('session_token', sessionToken)
      .single();

    if (!sessionError && session && session.admin) {
      // Check if session is expired
      if (new Date() > new Date(session.expires_at)) {
        return { isValid: false, admin: null };
      }

      // Update last access time
      await supabase
        .from('admin_sessions')
        .update({ last_access_at: new Date().toISOString() })
        .eq('session_id', session.session_id);

      return { 
        isValid: true, 
        admin: {
          admin_id: session.admin_id,
          username: session.admin.username
        }
      };
    }

    // Fallback to legacy admin table
    const { data: legacyAdmin, error: legacyError } = await supabase
      .from('admin')
      .select('admin_id, username, session_token, session_expires')
      .eq('session_token', sessionToken)
      .single();

    if (legacyError || !legacyAdmin) {
      return { isValid: false, admin: null };
    }

    // Check if legacy session is expired
    if (new Date() > new Date(legacyAdmin.session_expires)) {
      return { isValid: false, admin: null };
    }

    return { 
      isValid: true, 
      admin: {
        admin_id: legacyAdmin.admin_id,
        username: legacyAdmin.username
      }
    };

  } catch (error) {
    console.error('Session validation error:', error.message);
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