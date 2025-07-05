import { validateAdminSession } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { isValid, admin } = await validateAdminSession(req);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    res.status(200).json({ 
      message: 'Valid session',
      admin: {
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}