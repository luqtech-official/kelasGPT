import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

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

    if (sessionToken) {
      // Try to remove session from new admin_sessions table first
      let sessionCleared = false;
      try {
        const { error } = await supabase
          .from('admin_sessions')
          .delete()
          .eq('session_token', sessionToken);

        if (!error) {
          sessionCleared = true;
          console.log('Session cleared from admin_sessions table');
        }
      } catch (newSystemError) {
        console.log('New session system not available, using fallback');
      }

      // Fallback to old session system
      if (!sessionCleared) {
        const { error } = await supabase
          .from('admin')
          .update({ session_data: null })
          .eq('session_data->>token', sessionToken);

        if (error) {
          console.error('Error clearing admin session (fallback):', error);
        } else {
          console.log('Session cleared using fallback system');
        }
      }
    }

    // Clear cookies (adjust for environment)
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      res.setHeader('Set-Cookie', [
        'admin_session=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict',
        'admin_user=; Secure; Path=/; Max-Age=0; SameSite=Strict'
      ]);
    } else {
      res.setHeader('Set-Cookie', [
        'admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
        'admin_user=; Path=/; Max-Age=0; SameSite=Lax'
      ]);
    }

    res.status(200).json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}