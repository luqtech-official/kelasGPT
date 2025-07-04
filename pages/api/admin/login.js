import { supabase } from "../../../lib/supabase";
import crypto from 'crypto';

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

    // Verify password using simple hash comparison
    // Note: In production, consider using bcrypt for better security
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (passwordHash !== admin.password_hash) {
      console.warn(`Failed login attempt for username: ${username} from IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hour session

    // Update admin record with session data
    const sessionData = {
      token: sessionToken,
      expires_at: sessionExpiry.toISOString(),
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    };

    const { error: updateError } = await supabase
      .from('admin')
      .update({
        last_login_at: new Date().toISOString(),
        session_data: sessionData
      })
      .eq('admin_id', admin.admin_id);

    if (updateError) {
      console.error('Error updating admin session:', updateError);
      return res.status(500).json({ message: 'Internal Server Error' });
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