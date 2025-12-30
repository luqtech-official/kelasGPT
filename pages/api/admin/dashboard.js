import { requireAuth } from "../../../lib/adminAuth";
import { getProductSettings } from "../../../lib/settings";
import { getDashboardDataOptimized } from "../../../lib/supabase-dashboard";

async function handler(req, res) {
  
  // Disable Caching for Admin Data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const startTime = Date.now();
  
  try {
    console.log('🚀 Dashboard API request - Using optimized implementation');
    
    // Get optimized dashboard data
    const result = await getDashboardDataOptimized();
    
    if (!result.success) {
      console.error('❌ Optimized dashboard fetch failed:', result.error);
      throw new Error(result.error || 'Dashboard data fetch failed');
    }

    // Get product settings for accurate pricing
    const productSettings = await getProductSettings();
    result.data.averageOrderValue = productSettings.productPrice;

    const totalTime = Date.now() - startTime;
    console.log(`✅ Dashboard API completed in ${totalTime}ms`);

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('💥 Dashboard API error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Dashboard temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      _meta: {
        loadTime: totalTime,
        error: true,
        timestamp: new Date().toISOString()
      }
    });
  }
}


export default requireAuth(handler);