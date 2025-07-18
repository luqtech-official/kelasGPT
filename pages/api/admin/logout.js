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
      // Remove session from admin_sessions table
      const { error } = await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Error clearing admin session:', error);
      }
    }

    // Clear cookies
    res.setHeader('Set-Cookie', [
      'admin_session=; HttpOnly; Secure; Path=/admin; Max-Age=0; SameSite=Strict',
      'admin_user=; Path=/admin; Max-Age=0; SameSite=Strict'
    ]);

    res.status(200).json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}