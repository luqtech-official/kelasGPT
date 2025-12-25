import { getDiscountAmount } from '../../lib/discount-codes';

export default function handler(req, res) {
  // Set CORS headers to allow requests from the same origin and potentially others if needed
  res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this to specific domain in strict prod environments if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight/OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow GET for connectivity check
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Discount validation endpoint is ready.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ isValid: false, message: 'Code is required' });
    }

    const discountAmount = getDiscountAmount(code);

    if (discountAmount > 0) {
      return res.status(200).json({
        isValid: true,
        code: code.toUpperCase(),
        discountAmount: discountAmount,
        message: 'Discount applied successfully'
      });
    } else {
      return res.status(200).json({
        isValid: false,
        discountAmount: 0,
        message: 'Invalid discount code'
      });
    }
  } catch (error) {
    console.error('Error in validate-discount:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
