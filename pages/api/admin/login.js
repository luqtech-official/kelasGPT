import { supabase } from "../../../lib/supabase";
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Get admin user from database
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('admin_id, username, password_hash, role, email')
      .eq('username', username)
      .single();

    if (adminError || !admin) {
      // Log failed attempt without exposing sensitive info
      console.warn(`Failed login attempt for username: ${username} from IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      console.warn(`Failed login attempt for username: ${username} from IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hour session

    // Try to create session in new admin_sessions table
    let sessionCreated = false;
    try {
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          admin_id: admin.admin_id,
          session_token: sessionToken,
          expires_at: sessionExpiry.toISOString(),
          ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          user_agent: req.headers['user-agent']
        });

      if (!sessionError) {
        sessionCreated = true;
        console.log('Session created in new admin_sessions table');
      }
    } catch (newSystemError) {
      console.log('New session system not available, using fallback');
    }

    // Fallback to old session system if new system not available
    if (!sessionCreated) {
      const sessionData = {
        token: sessionToken,
        expires_at: sessionExpiry.toISOString(),
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      };

      const { error: fallbackError } = await supabase
        .from('admin')
        .update({
          last_login_at: new Date().toISOString(),
          session_data: sessionData
        })
        .eq('admin_id', admin.admin_id);

      if (fallbackError) {
        console.error('Error creating session (fallback):', fallbackError);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      console.log('Session created using fallback system');
    } else {
      // Update admin last login time (only if new system worked)
      const { error: updateError } = await supabase
        .from('admin')
        .update({ last_login_at: new Date().toISOString() })
        .eq('admin_id', admin.admin_id);

      if (updateError) {
        console.error('Error updating admin last login:', updateError);
        // Continue anyway - this is not critical
      }
    }

    // Set secure HTTP-only cookies (production-ready)
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Production: Secure, HttpOnly, root path for consistency
      res.setHeader('Set-Cookie', [
        `admin_session=${sessionToken}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Strict`,
        `admin_user=${admin.username}; Secure; Path=/; Max-Age=86400; SameSite=Strict`
      ]);
    } else {
      // Development: Relaxed settings for localhost
      res.setHeader('Set-Cookie', [
        `admin_session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
        `admin_user=${admin.username}; Path=/; Max-Age=86400; SameSite=Lax`
      ]);
    }

    // Log successful login
    console.log(`Successful admin login: ${username} from IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);

    res.status(200).json({ 
      message: 'Login successful',
      admin: {
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}