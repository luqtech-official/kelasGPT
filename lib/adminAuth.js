import { supabase } from './supabase';
import crypto from 'crypto';
import { createServerLogger } from './pino-logger';

export async function validateAdminSession(req) {
  const logger = createServerLogger({ function: 'validateAdminSession' });
  const startTime = Date.now();
  
  try {
    logger.dev.functionEntry({ 
      function: 'validateAdminSession', 
      params: { hasHeaders: !!req.headers, hasCookies: !!req.headers.cookie }
    });

    // Get session token from cookie
    const cookies = req.headers.cookie;
    let sessionToken = null;

    logger.dev.conditionalBranch({ 
      condition: 'cookies_exist', 
      result: !!cookies,
      cookieCount: cookies ? cookies.split(';').length : 0
    });

    if (cookies) {
      const cookieArray = cookies.split(';');
      const sessionCookie = cookieArray.find(cookie => cookie.trim().startsWith('admin_session='));
      if (sessionCookie) {
        sessionToken = sessionCookie.split('=')[1];
        logger.security.sessionEvent({
          action: 'SESSION_TOKEN_EXTRACTED',
          tokenLength: sessionToken.length,
          source: 'cookie'
        });
      }
    }

    if (!sessionToken) {
      logger.security.authAttempt({
        outcome: 'FAILED',
        reason: 'NO_SESSION_TOKEN',
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      logger.dev.functionExit({ 
        function: 'validateAdminSession', 
        result: 'INVALID_NO_TOKEN',
        duration: Date.now() - startTime
      });
      
      return { isValid: false, admin: null };
    }

    // Try new admin_sessions table first
    try {
      logger.database.queryStart({
        operation: 'SELECT_ADMIN_SESSIONS',
        table: 'admin_sessions',
        tokenHashPrefix: sessionToken.substring(0, 8)
      });

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
      
      logger.database.queryComplete({
        operation: 'SELECT_ADMIN_SESSIONS',
        duration: queryDuration,
        rowCount: session ? 1 : 0,
        hasError: !!sessionError
      });

      if (!sessionError && session && session.admin) {
        logger.security.sessionEvent({
          action: 'SESSION_FOUND',
          sessionId: session.session_id,
          adminId: session.admin_id,
          username: session.admin.username
        });

        // Check if session hasn't expired
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        const isExpired = now > expiresAt;
        
        logger.dev.conditionalBranch({
          condition: 'session_expired',
          result: isExpired,
          now: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          remainingTime: expiresAt.getTime() - now.getTime()
        });
        
        if (now <= expiresAt) {
          // Update last accessed time for session tracking
          logger.database.queryStart({
            operation: 'UPDATE_SESSION_ACCESS_TIME',
            sessionId: session.session_id
          });

          await supabase
            .from('admin_sessions')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('session_id', session.session_id);

          logger.security.authAttempt({
            outcome: 'SUCCESS',
            method: 'NEW_SESSION_SYSTEM',
            adminId: session.admin_id,
            username: session.admin.username,
            sessionId: session.session_id,
            ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
          });

          logger.dev.functionExit({ 
            function: 'validateAdminSession', 
            result: 'VALID_NEW_SYSTEM',
            duration: Date.now() - startTime
          });

          return { 
            isValid: true, 
            admin: {
              admin_id: session.admin.admin_id,
              username: session.admin.username,
              role: session.admin.role
            }
          };
        } else {
          logger.security.sessionEvent({
            action: 'SESSION_EXPIRED_CLEANUP',
            sessionId: session.session_id,
            adminId: session.admin_id,
            expiredBy: now.getTime() - expiresAt.getTime()
          });

          // Session expired, remove it from database
          await supabase
            .from('admin_sessions')
            .delete()
            .eq('session_id', session.session_id);

          logger.security.authAttempt({
            outcome: 'FAILED',
            reason: 'SESSION_EXPIRED',
            sessionId: session.session_id,
            adminId: session.admin_id
          });
        }
      } else {
        logger.security.sessionEvent({
          action: 'SESSION_NOT_FOUND',
          hasError: !!sessionError,
          errorMessage: sessionError?.message
        });
      }
    } catch (newSystemError) {
      logger.security.sessionEvent({
        action: 'SESSION_SYSTEM_FALLBACK_ACTIVATED',
        error: newSystemError.message,
        fallbackReason: 'NEW_SYSTEM_ERROR'
      });
      
      logger.warn('Session system fallback activated', { 
        error: newSystemError.message,
        tokenHashPrefix: sessionToken.substring(0, 8)
      });
    }

    // Fallback to old admin table session system
    logger.security.sessionEvent({
      action: 'FALLBACK_SYSTEM_QUERY',
      reason: 'PRIMARY_SYSTEM_UNAVAILABLE'
    });

    logger.database.queryStart({
      operation: 'SELECT_ADMIN_FALLBACK',
      table: 'admin'
    });

    const fallbackQueryStart = Date.now();
    const { data: admins, error: adminError } = await supabase
      .from('admin')
      .select('admin_id, username, role, session_data')
      .not('session_data', 'is', null);

    logger.database.queryComplete({
      operation: 'SELECT_ADMIN_FALLBACK',
      duration: Date.now() - fallbackQueryStart,
      rowCount: admins?.length || 0,
      hasError: !!adminError
    });

    if (adminError || !admins || admins.length === 0) {
      logger.security.authAttempt({
        outcome: 'FAILED',
        reason: 'FALLBACK_QUERY_FAILED',
        error: adminError?.message,
        adminCount: admins?.length || 0
      });

      logger.dev.functionExit({ 
        function: 'validateAdminSession', 
        result: 'INVALID_FALLBACK_FAILED',
        duration: Date.now() - startTime
      });

      return { isValid: false, admin: null };
    }

    logger.security.suspiciousActivity({
      description: 'MULTIPLE_ADMIN_SESSIONS_ACTIVE',
      adminCount: admins.length,
      adminUsernames: admins.map(a => a.username),
      severity: admins.length > 3 ? 'HIGH' : 'MEDIUM'
    });

    // Find admin with matching session token
    const admin = admins.find(a => 
      a.session_data && a.session_data.token === sessionToken
    );

    if (!admin || !admin.session_data) {
      logger.security.authAttempt({
        outcome: 'FAILED',
        reason: 'TOKEN_NOT_FOUND_IN_FALLBACK',
        searchedAdmins: admins.length,
        tokenHashPrefix: sessionToken.substring(0, 8)
      });

      logger.dev.functionExit({ 
        function: 'validateAdminSession', 
        result: 'INVALID_TOKEN_NOT_FOUND',
        duration: Date.now() - startTime
      });

      return { isValid: false, admin: null };
    }

    // Check if session hasn't expired
    const now = new Date();
    const expiresAt = new Date(admin.session_data.expires_at);
    const isExpired = now > expiresAt;
    
    logger.dev.conditionalBranch({
      condition: 'fallback_session_expired',
      result: isExpired,
      adminId: admin.admin_id,
      username: admin.username,
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    });
    
    if (now > expiresAt) {
      logger.security.sessionEvent({
        action: 'FALLBACK_SESSION_EXPIRED_CLEANUP',
        adminId: admin.admin_id,
        username: admin.username,
        expiredBy: now.getTime() - expiresAt.getTime()
      });

      // Session expired, clear it
      await supabase
        .from('admin')
        .update({ session_data: null })
        .eq('admin_id', admin.admin_id);

      logger.security.authAttempt({
        outcome: 'FAILED',
        reason: 'FALLBACK_SESSION_EXPIRED',
        adminId: admin.admin_id,
        username: admin.username
      });

      logger.dev.functionExit({ 
        function: 'validateAdminSession', 
        result: 'INVALID_EXPIRED',
        duration: Date.now() - startTime
      });
      
      return { isValid: false, admin: null };
    }

    logger.security.authAttempt({
      outcome: 'SUCCESS',
      method: 'FALLBACK_SESSION_SYSTEM',
      adminId: admin.admin_id,
      username: admin.username,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });

    logger.dev.functionExit({ 
      function: 'validateAdminSession', 
      result: 'VALID_FALLBACK_SYSTEM',
      duration: Date.now() - startTime
    });

    return { 
      isValid: true, 
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        role: admin.role
      }
    };

  } catch (error) {
    logger.error('Session validation error', { 
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime
    });

    logger.dev.functionExit({ 
      function: 'validateAdminSession', 
      result: 'ERROR',
      error: error.message,
      duration: Date.now() - startTime
    });

    return { isValid: false, admin: null };
  }
}

export function generateCSRFToken() {
  const logger = createServerLogger({ function: 'generateCSRFToken' });
  
  logger.dev.functionEntry({ 
    function: 'generateCSRFToken', 
    params: {} 
  });

  const token = crypto.randomBytes(32).toString('hex');
  
  logger.security.csrfEvent({
    action: 'TOKEN_GENERATED',
    tokenLength: token.length,
    entropy: 32
  });

  logger.dev.functionExit({ 
    function: 'generateCSRFToken', 
    result: 'TOKEN_GENERATED',
    tokenLength: token.length
  });

  return token;
}

export function validateCSRFToken(sessionToken, providedToken) {
  const logger = createServerLogger({ function: 'validateCSRFToken' });
  const startTime = Date.now();
  
  logger.dev.functionEntry({ 
    function: 'validateCSRFToken', 
    params: { 
      hasSessionToken: !!sessionToken,
      hasProvidedToken: !!providedToken,
      sessionTokenLength: sessionToken?.length || 0,
      providedTokenLength: providedToken?.length || 0
    }
  });

  if (!sessionToken || !providedToken) {
    logger.security.csrfEvent({
      action: 'VALIDATION_FAILED',
      reason: 'MISSING_TOKENS',
      hasSessionToken: !!sessionToken,
      hasProvidedToken: !!providedToken
    });

    logger.dev.functionExit({ 
      function: 'validateCSRFToken', 
      result: 'INVALID_MISSING_TOKENS',
      duration: Date.now() - startTime
    });

    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  try {
    logger.dev.conditionalBranch({
      condition: 'timing_safe_comparison',
      sessionTokenLength: sessionToken.length,
      providedTokenLength: providedToken.length
    });

    const comparisonStart = Date.now();
    const isValid = crypto.timingSafeEqual(
      Buffer.from(sessionToken, 'hex'),
      Buffer.from(providedToken, 'hex')
    );
    const comparisonDuration = Date.now() - comparisonStart;

    logger.security.csrfEvent({
      action: 'VALIDATION_COMPLETED',
      result: isValid ? 'VALID' : 'INVALID',
      comparisonDuration,
      timingSafe: true
    });

    if (comparisonDuration > 5) {
      logger.performance.slowOperation({
        operation: 'csrf_token_comparison',
        duration: comparisonDuration,
        threshold: 5
      });
    }

    logger.dev.functionExit({ 
      function: 'validateCSRFToken', 
      result: isValid ? 'VALID' : 'INVALID',
      duration: Date.now() - startTime
    });

    return isValid;
  } catch (error) {
    logger.security.csrfEvent({
      action: 'VALIDATION_ERROR',
      error: error.message,
      errorType: error.name
    });

    logger.error('CSRF token validation error', { 
      error: error.message,
      stack: error.stack
    });

    logger.dev.functionExit({ 
      function: 'validateCSRFToken', 
      result: 'ERROR',
      error: error.message,
      duration: Date.now() - startTime
    });

    return false;
  }
}

export async function getCSRFToken(admin_id) {
  const logger = createServerLogger({ function: 'getCSRFToken' });
  const startTime = Date.now();
  
  try {
    logger.dev.functionEntry({ 
      function: 'getCSRFToken', 
      params: { admin_id }
    });

    // Generate new CSRF token (session-only until database column is added)
    const csrfToken = generateCSRFToken();
    
    logger.security.csrfEvent({
      action: 'NEW_TOKEN_GENERATED',
      adminId: admin_id,
      tokenLength: csrfToken.length
    });

    logger.dev.conditionalBranch({
      condition: 'database_column_available',
      result: false,
      note: 'csrf_token column not yet added to admin_sessions table'
    });

    logger.dev.functionExit({ 
      function: 'getCSRFToken', 
      result: 'NEW_TOKEN_GENERATED',
      duration: Date.now() - startTime
    });

    return csrfToken;
  } catch (error) {
    logger.error('Error getting CSRF token', { 
      error: error.message,
      stack: error.stack,
      adminId: admin_id
    });

    logger.security.csrfEvent({
      action: 'TOKEN_RETRIEVAL_ERROR',
      adminId: admin_id,
      error: error.message
    });

    logger.dev.functionExit({ 
      function: 'getCSRFToken', 
      result: 'FALLBACK_TOKEN',
      error: error.message,
      duration: Date.now() - startTime
    });

    return generateCSRFToken(); // Fallback to a new token
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const logger = createServerLogger({ 
      function: 'requireAuth',
      endpoint: req.url,
      method: req.method
    });
    const startTime = Date.now();

    logger.dev.functionEntry({ 
      function: 'requireAuth', 
      params: { 
        endpoint: req.url, 
        method: req.method,
        hasHandler: typeof handler === 'function'
      }
    });

    logger.security.authAttempt({
      outcome: 'CHECKING',
      endpoint: req.url,
      method: req.method,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    const { isValid, admin } = await validateAdminSession(req);
    
    if (!isValid) {
      logger.security.authAttempt({
        outcome: 'FAILED',
        reason: 'INVALID_SESSION',
        endpoint: req.url,
        method: req.method
      });

      logger.security.permissionDenied({
        resource: req.url,
        reason: 'AUTHENTICATION_REQUIRED',
        method: req.method
      });

      logger.dev.functionExit({ 
        function: 'requireAuth', 
        result: 'AUTHENTICATION_FAILED',
        duration: Date.now() - startTime
      });

      return res.status(401).json({ message: 'Authentication required' });
    }

    logger.security.authAttempt({
      outcome: 'SUCCESS',
      adminId: admin.admin_id,
      username: admin.username,
      endpoint: req.url,
      method: req.method
    });

    // Add admin info to request object
    req.admin = admin;

    logger.dev.functionExit({ 
      function: 'requireAuth', 
      result: 'AUTHENTICATED',
      adminId: admin.admin_id,
      username: admin.username,
      duration: Date.now() - startTime
    });
    
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

    logger.dev.functionEntry({ 
      function: 'requireAuthWithCSRF', 
      params: { 
        endpoint: req.url, 
        method: req.method,
        hasHandler: typeof handler === 'function'
      }
    });

    logger.security.authAttempt({
      outcome: 'CHECKING_WITH_CSRF',
      endpoint: req.url,
      method: req.method,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    const { isValid, admin } = await validateAdminSession(req);
    
    if (!isValid) {
      logger.security.authAttempt({
        outcome: 'FAILED',
        reason: 'INVALID_SESSION',
        endpoint: req.url,
        method: req.method
      });

      logger.security.permissionDenied({
        resource: req.url,
        reason: 'AUTHENTICATION_REQUIRED',
        method: req.method
      });

      logger.dev.functionExit({ 
        function: 'requireAuthWithCSRF', 
        result: 'AUTHENTICATION_FAILED',
        duration: Date.now() - startTime
      });

      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check CSRF token for state-changing operations (POST, PUT, DELETE)
    const needsCSRF = ['POST', 'PUT', 'DELETE'].includes(req.method);
    
    logger.dev.conditionalBranch({
      condition: 'needs_csrf_validation',
      result: needsCSRF,
      method: req.method
    });

    if (needsCSRF) {
      const providedCSRFToken = req.headers['x-csrf-token'] || req.body._csrf;
      
      logger.security.csrfEvent({
        action: 'CSRF_VALIDATION_REQUIRED',
        adminId: admin.admin_id,
        username: admin.username,
        hasProvidedToken: !!providedCSRFToken,
        tokenSource: req.headers['x-csrf-token'] ? 'header' : (req.body._csrf ? 'body' : 'none')
      });
      
      if (!providedCSRFToken) {
        logger.security.csrfEvent({
          action: 'CSRF_TOKEN_MISSING',
          adminId: admin.admin_id,
          endpoint: req.url,
          method: req.method
        });

        logger.security.permissionDenied({
          resource: req.url,
          reason: 'CSRF_TOKEN_REQUIRED',
          adminId: admin.admin_id
        });

        logger.dev.functionExit({ 
          function: 'requireAuthWithCSRF', 
          result: 'CSRF_TOKEN_MISSING',
          duration: Date.now() - startTime
        });

        return res.status(403).json({ message: 'CSRF token required' });
      }

      // Get the current CSRF token for this admin
      const sessionCSRFToken = await getCSRFToken(admin.admin_id);
      
      const csrfValidationStart = Date.now();
      const isValidCSRF = validateCSRFToken(sessionCSRFToken, providedCSRFToken);
      const csrfValidationDuration = Date.now() - csrfValidationStart;

      logger.security.csrfEvent({
        action: 'CSRF_VALIDATION_COMPLETED',
        adminId: admin.admin_id,
        result: isValidCSRF ? 'VALID' : 'INVALID',
        validationDuration: csrfValidationDuration
      });
      
      if (!isValidCSRF) {
        logger.security.csrfEvent({
          action: 'CSRF_VALIDATION_FAILED',
          adminId: admin.admin_id,
          endpoint: req.url,
          method: req.method,
          providedTokenLength: providedCSRFToken.length
        });

        logger.security.suspiciousActivity({
          description: 'CSRF_TOKEN_MISMATCH',
          adminId: admin.admin_id,
          username: admin.username,
          endpoint: req.url,
          severity: 'HIGH'
        });

        logger.security.permissionDenied({
          resource: req.url,
          reason: 'INVALID_CSRF_TOKEN',
          adminId: admin.admin_id
        });

        logger.dev.functionExit({ 
          function: 'requireAuthWithCSRF', 
          result: 'CSRF_VALIDATION_FAILED',
          duration: Date.now() - startTime
        });

        return res.status(403).json({ message: 'Invalid CSRF token' });
      }

      logger.security.csrfEvent({
        action: 'CSRF_VALIDATION_SUCCESS',
        adminId: admin.admin_id,
        username: admin.username,
        endpoint: req.url
      });
    }

    logger.security.authAttempt({
      outcome: 'SUCCESS',
      adminId: admin.admin_id,
      username: admin.username,
      endpoint: req.url,
      method: req.method,
      csrfValidated: needsCSRF
    });

    // Add admin info to request object
    req.admin = admin;

    logger.dev.functionExit({ 
      function: 'requireAuthWithCSRF', 
      result: 'AUTHENTICATED_WITH_CSRF',
      adminId: admin.admin_id,
      username: admin.username,
      duration: Date.now() - startTime
    });
    
    return handler(req, res);
  };
}