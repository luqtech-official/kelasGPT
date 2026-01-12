import { Redis } from '@upstash/redis';

const GITHUB_PRIMARY_URL = "https://raw.githubusercontent.com/luqtech-official/kelasgpt-public-resources/main/data/social_noti.json";
const GITHUB_FALLBACK_URL = "https://cdn.jsdelivr.net/gh/luqtech-official/kelasgpt-public-resources@main/data/social_noti.json";

// Initialize Redis client if credentials are present
let redis;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function getSocialProofNotifications() {
  let notifications = null;

  // 1. Try Upstash Redis
  if (redis) {
    try {
      // Assuming data is stored under the key 'social_proof_data'
      notifications = await redis.get('social_proof_data');
      
      // Basic validation to ensure we got an array
      if (notifications && Array.isArray(notifications) && notifications.length > 0) {
        return notifications;
      }
    } catch (error) {
      console.error("Error fetching from Upstash Redis:", error);
      // Continue to fallback
    }
  }

  // 2. Fallback to GitHub (Primary)
  try {
    const res = await fetch(GITHUB_PRIMARY_URL, { cache: 'no-store' });
    if (res.ok) {
        notifications = await res.json();
        return notifications;
    }
  } catch (error) {
     console.warn("Primary GitHub source failed, trying secondary fallback...", error);
  }

  // 3. Fallback to jsDelivr (Secondary)
  try {
    const res = await fetch(GITHUB_FALLBACK_URL, { cache: 'no-store' });
    if (res.ok) {
        notifications = await res.json();
        return notifications;
    }
  } catch (error) {
    console.error("All social proof sources failed:", error);
  }

  return [];
}
