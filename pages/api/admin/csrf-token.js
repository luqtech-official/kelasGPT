import { requireAuth, getCSRFToken } from '../../../lib/adminAuth';

async function csrfTokenHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const csrfToken = await getCSRFToken(req.admin.admin_id);
    
    res.status(200).json({
      success: true,
      csrfToken: csrfToken
    });
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get CSRF token'
    });
  }
}

export default requireAuth(csrfTokenHandler);