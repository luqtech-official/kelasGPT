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

    // Create new session in admin_sessions table
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: admin.admin_id,
        session_token: sessionToken,
        expires_at: sessionExpiry.toISOString(),
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      });

    if (sessionError) {
      console.error('Error creating admin session:', sessionError);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Update admin last login time
    const { error: updateError } = await supabase
      .from('admin')
      .update({ last_login_at: new Date().toISOString() })
      .eq('admin_id', admin.admin_id);

    if (updateError) {
      console.error('Error updating admin last login:', updateError);
      // Continue anyway - this is not critical
    }

    // Set secure HTTP-only cookie
    res.setHeader('Set-Cookie', [
      `admin_session=${sessionToken}; HttpOnly; Secure; Path=/admin; Max-Age=86400; SameSite=Strict`,
      `admin_user=${admin.username}; Path=/admin; Max-Age=86400; SameSite=Strict`
    ]);

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