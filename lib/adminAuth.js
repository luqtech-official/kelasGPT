import { supabase } from './supabase';
import crypto from 'crypto';
import { createServerLogger } from './pino-logger';

export async function validateAdminSession(req) {
  const logger = createServerLogger({ function: 'validateAdminSession' });
  const startTime = Date.now();
  
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
      
      const queryStartTime = Date.now();
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

      const queryDuration = Date.now() - queryStartTime;
      
      if (!sessionError && session && session.admin) {
      
        // Check if session hasn't expired
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        const isExpired = now > expiresAt;
        
        
        if (now <= expiresAt) {
          // Update last accessed time for session tracking
          let createUTCTimestamp;
          try {
            ({ createUTCTimestamp } = await import('./timezone-utils.js'));
          } catch (importError) {
            console.warn('Failed to import timezone-utils in adminAuth, using fallback', { error: importError.message });
            createUTCTimestamp = () => new Date().toISOString();
          }
          
          await supabase
            .from('admin_sessions')
            .update({ last_accessed_at: createUTCTimestamp() })
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

    }

    // Fallback to old admin table session system
    const fallbackQueryStart = Date.now();
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
    const isExpired = now > expiresAt;
        
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
      return { isValid: false, admin: null };
  }
}

export function generateCSRFToken() {
  const logger = createServerLogger({ function: 'generateCSRFToken' });
  
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

export function validateCSRFToken(sessionToken, providedToken) {
  const logger = createServerLogger({ function: 'validateCSRFToken' });
  const startTime = Date.now();
  
  if (!sessionToken || !providedToken) {

    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  try {

    const comparisonStart = Date.now();
    const isValid = crypto.timingSafeEqual(
      Buffer.from(sessionToken, 'hex'),
      Buffer.from(providedToken, 'hex')
    );
    const comparisonDuration = Date.now() - comparisonStart;


    if (comparisonDuration > 5) {
    }

    return isValid;
  } catch (error) {

    return false;
  }
}

export async function getCSRFToken(admin_id) {
  const logger = createServerLogger({ function: 'getCSRFToken' });
  const startTime = Date.now();
  
  try {

    // Generate new CSRF token (session-only until database column is added)
    const csrfToken = generateCSRFToken();
    

    return csrfToken;
  } catch (error) {
    return generateCSRFToken(); // Fallback to a new token
  }
}

export function requireAuth(handler) {
  return async (req, res) => {

    const startTime = Date.now();
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
    const logger = createServerLogger({ 
      function: 'requireAuthWithCSRF',
      endpoint: req.url,
      method: req.method
    });
    const startTime = Date.now();

    const { isValid, admin } = await validateAdminSession(req);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check CSRF token for state-changing operations (POST, PUT, DELETE)
    const needsCSRF = ['POST', 'PUT', 'DELETE'].includes(req.method);
    
    if (needsCSRF) {
      const providedCSRFToken = req.headers['x-csrf-token'] || req.body._csrf;
      
      if (!providedCSRFToken) {
        return res.status(403).json({ message: 'CSRF token required' });
      }

      // Get the current CSRF token for this admin
      const sessionCSRFToken = await getCSRFToken(admin.admin_id);
      
      const csrfValidationStart = Date.now();
      const isValidCSRF = validateCSRFToken(sessionCSRFToken, providedCSRFToken);
      const csrfValidationDuration = Date.now() - csrfValidationStart;

      if (!isValidCSRF) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
      }

    }

    // Add admin info to request object
    req.admin = admin;

    return handler(req, res);
  };
}