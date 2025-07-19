import { supabase } from './supabase';
import crypto from 'crypto';

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

export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(sessionToken, providedToken) {
  if (!sessionToken || !providedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(sessionToken, 'hex'),
      Buffer.from(providedToken, 'hex')
    );
  } catch (error) {
    return false;
  }
}

export async function getCSRFToken(admin_id) {
  try {
    // Try to get existing CSRF token from admin_sessions table
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('csrf_token')
      .eq('admin_id', admin_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && session && session.csrf_token) {
      return session.csrf_token;
    }

    // Generate new CSRF token
    const csrfToken = generateCSRFToken();
    
    // Update the most recent session with CSRF token
    await supabase
      .from('admin_sessions')
      .update({ csrf_token: csrfToken })
      .eq('admin_id', admin_id)
      .order('created_at', { ascending: false })
      .limit(1);

    return csrfToken;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return generateCSRFToken(); // Fallback to a new token
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

export function requireAuthWithCSRF(handler) {
  return async (req, res) => {
    const { isValid, admin } = await validateAdminSession(req);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check CSRF token for state-changing operations (POST, PUT, DELETE)
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const providedCSRFToken = req.headers['x-csrf-token'] || req.body._csrf;
      
      if (!providedCSRFToken) {
        return res.status(403).json({ message: 'CSRF token required' });
      }

      // Get the current CSRF token for this admin
      const sessionCSRFToken = await getCSRFToken(admin.admin_id);
      
      if (!validateCSRFToken(sessionCSRFToken, providedCSRFToken)) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
      }
    }

    // Add admin info to request object
    req.admin = admin;
    
    return handler(req, res);
  };
}