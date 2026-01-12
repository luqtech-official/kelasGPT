import { getSocialProofNotifications } from '../../lib/social-proof';

export default async function handler(req, res) {
  try {
    const notifications = await getSocialProofNotifications();
    
    // Cache the response for 60 seconds to reduce load on Redis/GitHub
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('API Error fetching social proof:', error);
    res.status(500).json([]);
  }
}
