// --- Client-Side Analytics Tracking Utility ---
// Manages visitor identification, page view tracking, and cross-browser journey persistence.

// --- Constants ---
const VISITOR_ID_KEY = 'kgpt_visitor_id';
const VISITOR_ID_PARAM = 'vid';
const VISITOR_ID_REGEX = /^v_\d{13}_[a-zA-Z0-9]{8}$/;
const LINK_SELECTOR = 'a[href*="/checkout"], a[href*="/videolisting"]';

// --- State ---
let socialBrowserCache = null;

// --- Core Functions ---

/**
 * Primary function to track a page view.
 * It resolves the visitor ID from multiple sources, then sends the tracking data.
 * @param {string} pagePath - The path of the page being viewed (e.g., '/', '/checkout').
 */
export function trackPageView(pagePath) {
  if (!isTrackingEnabled()) {
    console.log('Tracking is disabled.');
    return;
  }

  const visitorId = getOrCreateVisitorId();
  
  sendTrackingData(pagePath, visitorId);
}

/**
 * Initializes link modification for social media in-app browsers.
 * If a social browser is detected, it modifies checkout/videolisting links to include the visitor ID.
 */
export function initializeLinkModification() {
  const detection = getCachedSocialDetection();
  
  if (detection.isInApp) {
    const visitorId = getOrCreateVisitorId();
    if (visitorId) {
      modifyLinksForSocialBrowser(visitorId);
    }
  }
}

// --- Visitor ID Management ---

/**
 * Retrieves or creates a visitor ID with a multi-source resolution strategy.
 * Priority: URL parameter > localStorage > new ID.
 * @returns {string} The resolved or newly created visitor ID.
 */
function getOrCreateVisitorId() {
  // 1. Check URL parameters (highest priority)
  const urlVisitorId = getVisitorIdFromURL();
  if (urlVisitorId && validateVisitorId(urlVisitorId)) {
    saveVisitorIdToStorage(urlVisitorId);
    return urlVisitorId;
  }
  
  // 2. Check localStorage (fallback for same-browser navigation)
  const storageVisitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (storageVisitorId && validateVisitorId(storageVisitorId)) {
    return storageVisitorId;
  }
  
  // 3. Generate new ID (last resort)
  const newVisitorId = generateVisitorId();
  saveVisitorIdToStorage(newVisitorId);
  return newVisitorId;
}

/**
 * Extracts the visitor ID from the URL's query parameters.
 * @returns {string|null} The visitor ID from the URL, or null if not present.
 */
function getVisitorIdFromURL() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(VISITOR_ID_PARAM);
  } catch (e) {
    console.error('Error parsing URL parameters:', e);
    return null;
  }
}

/**
 * Validates the format of a visitor ID.
 * @param {string} visitorId - The visitor ID to validate.
 * @returns {boolean} True if the ID is valid, false otherwise.
 */
function validateVisitorId(visitorId) {
  if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 50) {
    return false;
  }
  return VISITOR_ID_REGEX.test(visitorId);
}

/**
 * Generates a new, privacy-friendly visitor ID.
 * Format: v_{timestamp}_{random_string}
 * @returns {string} A new visitor ID.
 */
function generateVisitorId() {
  return `v_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

/**
 * Saves the visitor ID to localStorage.
 * @param {string} visitorId - The visitor ID to save.
 */
function saveVisitorIdToStorage(visitorId) {
  try {
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  } catch (e) {
    console.error('Could not save visitor ID to localStorage:', e);
  }
}

// --- Social Media Browser Detection & Link Modification ---

/**
 * Detects if the user is in a social media in-app browser.
 * Caches the result for performance.
 * @returns {{platform: string|null, isInApp: boolean}}
 */
function getCachedSocialDetection() {
  if (socialBrowserCache === null) {
    socialBrowserCache = detectSocialInAppBrowser();
  }
  return socialBrowserCache;
}

/**
 * Performs the actual detection of social media in-app browsers.
 * @returns {{platform: string|null, isInApp: boolean}}
 */
function detectSocialInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  
  const platforms = {
    facebook: /FBAN|FBAV|FB_IAB|FB4A/i,
    instagram: /Instagram/i,
    tiktok: /trill|ByteDance|TikTok/i,
    twitter: /Twitter/i,
    linkedin: /LinkedIn/i,
    wechat: /MicroMessenger/i
  };
  
  for (const [platform, pattern] of Object.entries(platforms)) {
    if (pattern.test(ua)) {
      return { platform, isInApp: true };
    }
  }
  
  return { platform: null, isInApp: false };
}

/**
 * Modifies links on the page to include the visitor ID for cross-browser tracking.
 * Uses requestIdleCallback for performance.
 * @param {string} visitorId - The visitor ID to append to links.
 */
function modifyLinksForSocialBrowser(visitorId) {
  const task = () => {
    const links = document.querySelectorAll(LINK_SELECTOR);
    links.forEach(link => {
      try {
        const url = new URL(link.href, window.location.origin);
        url.searchParams.set(VISITOR_ID_PARAM, visitorId);
        link.href = url.toString();
      } catch (e) {
        console.error(`Failed to modify link: ${link.href}`, e);
      }
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(task);
  } else {
    setTimeout(task, 0);
  }
}

// --- Data Transmission & Privacy ---

/**
 * Sends the tracking data to the server-side API endpoint.
 * @param {string} pagePath - The path of the page being viewed.
 * @param {string} visitorId - The visitor's unique ID.
 */
async function sendTrackingData(pagePath, visitorId) {
  try {
    await fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pagePath, visitorId }),
      keepalive: true // Ensures request is sent even if page is unloading
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}

/**
 * Checks if tracking is enabled.
 * Placeholder for future privacy controls (e.g., DNT, GDPR consent).
 * @returns {boolean} True if tracking is enabled, false otherwise.
 */
function isTrackingEnabled() {
  // Future: Check for Do Not Track, GDPR consent, etc.
  // if (typeof window !== 'undefined' && window.navigator && window.navigator.doNotTrack === '1') {
  //   return false;
  // }
 
  return true;
}
