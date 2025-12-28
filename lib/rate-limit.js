// Simple in-memory rate limiter for serverless functions
// Note: In Vercel/Serverless, memory is not shared across all instances, 
// but this is sufficient to stop single-instance rapid spam attacks.

const rateLimitMap = new Map();

export default function rateLimit(options) {
  const {
    interval = 60 * 1000, // Window size in milliseconds (default 1 minute)
    uniqueTokenPerInterval = 500, // Max users to track per window
  } = options;

  return {
    check: (res, limit, token) => new Promise((resolve, reject) => {
      const now = Date.now();
      const windowStart = now - interval;

      // Clean up old entries to prevent memory leak
      if (rateLimitMap.size > uniqueTokenPerInterval) {
        // Naive cleanup: just clear everything if too full
        rateLimitMap.clear();
      }

      const tokenCount = rateLimitMap.get(token) || [];
      // Filter out timestamps older than the window
      const recentTokens = tokenCount.filter(timestamp => timestamp > windowStart);

      if (recentTokens.length >= limit) {
        res.setHeader('Retry-After', Math.ceil(interval / 1000));
        return reject(new Error('Rate limit exceeded'));
      }

      // Add current request
      recentTokens.push(now);
      rateLimitMap.set(token, recentTokens);
      
      resolve();
    }),
  };
}
