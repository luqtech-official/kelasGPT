import { requireAuth } from '../../../lib/adminAuth-clean';

async function handler(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Customers API auth working',
      admin: req.admin,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Handler error',
      message: error.message,
      stack: error.stack
    });
  }
}

export default requireAuth(handler);