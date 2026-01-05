/**
 * GitHub Image Loader & Utilities
 * Serves images directly from GitHub Raw
 * Created as a replacement for ImageKit on specific pages
 */

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/luqtech-official/kelasgpt-public-resources/main/images';
const IMAGEKIT_FALLBACK_BASE_URL = 'https://ik.imagekit.io/kelasgptcdnid';

// Map existing ImageKit identifiers/paths to GitHub filenames
// Handles both abstract keys (e.g. 'nanobanana-hero') and direct paths used in the code
const GIT_IMAGE_MAPPING = {
  // --- Hero Section ---
  'nanobanana-hero': 'Hero Banner Comparison Image_clean.png',
  
  // --- Infographics & Educational ---
  'nanobanana-infographic': 'Scientific Infographic Image.png',
  'KelasGPT_NanoBanana/Scientific%20Infographic%20Image.png': 'Scientific Infographic Image.png',
  'KelasGPT_NanoBanana/Studygram%20Jantung.png': 'Studygram Jantung.png',
  'KelasGPT_NanoBanana/Studygram%20Nucleus.png': 'Studygram Nucleus.png',
  'KelasGPT_NanoBanana/Case%20Study%202_Infographic%20for%20Kids.png': 'Case Study 2_Infographic for Kids.png',
  'nanobanana-infographic-kids': 'Case Study 2_Infographic for Kids.png',

  // --- Food Photography ---
  'nanobanana-food': 'Premium Food Image Analysis.png',
  'KelasGPT_NanoBanana/Premium%20Food%20Image%20Analysis.png': 'Premium Food Image Analysis.png',
  
  // --- Nasi Kandar Case Study ---
  'nanobanana-nasi-before': 'Nasi Kandar Celebration Card_Before.jpg',
  'nanobanana-nasi-after': 'Nasi Kandar Celebration Card_After.png',
  'KelasGPT_NanoBanana/Nasi%20Kandar%20Celebration%20Card_Before.jpg': 'Nasi Kandar Celebration Card_Before.jpg',
  'KelasGPT_NanoBanana/Nasi%20Kandar%20Celebration%20Card_After.png': 'Nasi Kandar Celebration Card_After.png',

  // --- Tripod Product Showcase ---
  'nanobanana-tripod-before': 'Tripod_before_enhanced.webp',
  'KelasGPT_NanoBanana/Tripod_before_enhanced.webp': 'Tripod_before_enhanced.webp',
  'KelasGPT_NanoBanana/Tripod_after_enhanced1.png': 'Tripod_after_enhanced1.png',
  'KelasGPT_NanoBanana/Tripod_after_enhanced2.png': 'Tripod_after_enhanced2.png',
  'KelasGPT_NanoBanana/Tripod_after_enhanced3.png': 'Tripod_after_enhanced3.png',
  'KelasGPT_NanoBanana/Tripod_after_enhanced4.png': 'Tripod_after_enhanced4.png',

  // --- Baby Car Seat ---
  'nanobanana-baby-car-seat-before': 'baby_car_seat_before_enhanced.jfif',
  'nanobanana-baby-car-seat-after': 'baby_car_seat_after_enhanced.png',
  'KelasGPT_NanoBanana/baby_car_seat_before_enhanced.jfif': 'baby_car_seat_before_enhanced.jfif',
  'KelasGPT_NanoBanana/baby_car_seat_after_enhanced.png': 'baby_car_seat_after_enhanced.png',

  // --- Portraits & People ---
  'nanobanana-woman-before': 'Woman Cinematic Bokeh Portrait_Before.png',
  'nanobanana-woman-after': 'Woman Cinematic Bokeh Portrait_After.png',
  'KelasGPT_NanoBanana/Woman%20Cinematic%20Bokeh%20Portrait_Before.png': 'Woman Cinematic Bokeh Portrait_Before.png',
  'KelasGPT_NanoBanana/Woman%20Cinematic%20Bokeh%20Portrait_After.png': 'Woman Cinematic Bokeh Portrait_After.png',
  
  'KelasGPT_NanoBanana/Woman_chiaschuro.png': 'Woman_chiaschuro.png',
  'KelasGPT_NanoBanana/Woman_birthday.png': 'Woman_birthday.png',
  'KelasGPT_NanoBanana/Man_chiaschuro.png': 'Man_chiaschuro.png',
  'KelasGPT_NanoBanana/Man_cinematic.png': 'Man_cinematic.png',
  'KelasGPT_NanoBanana/woman_with_rifle_cinematic_shot.png': 'woman_with_rifle_cinematic_shot.png',
  'KelasGPT_NanoBanana/Posture_modified.png': 'Posture_modified.png',
  'KelasGPT_NanoBanana/Fun_couple_image.png': 'Fun_couple_image.png',
  'KelasGPT_NanoBanana/Kids_birthday.png': 'Kids_birthday.png',

  // --- Creative / Other ---
  'KelasGPT_NanoBanana/meme_modified.png': 'meme_modified.png',
  'KelasGPT_NanoBanana/Gadget_Exploding_view.png': 'Gadget_Exploding_view.png',
  'KelasGPT_NanoBanana/Knolling_image.png': 'Knolling_image.png',
  'nanobanana-nature': 'Nature Photography Image Analysis.png',
  'KelasGPT_NanoBanana/Nature%20Photography%20Image%20Analysis.png': 'Nature Photography Image Analysis.png',

  // --- Style Transfer ---
  'nanobanana-style-before': 'Multi Style Transfer_Before.jfif',
  'nanobanana-style-after': 'Multi Style Transfer_After.png',
  'KelasGPT_NanoBanana/Multi%20Style%20Transfer_Before.jfif': 'Multi Style Transfer_Before.jfif',
  'KelasGPT_NanoBanana/Multi%20Style%20Transfer_After.png': 'Multi Style Transfer_After.png',

  // --- Book Content ---
  'nanobanana-content-1': 'Book Content Images 1.png',
  'nanobanana-content-2': 'Book Content Images 2.png',
  'KelasGPT_NanoBanana/Book%20Content%20Images%201.png': 'Book Content Images 1.png',
  'KelasGPT_NanoBanana/Book%20Content%20Images%202.png': 'Book Content Images 2.png',

  // --- Book Snippets ---
  'nanobanana-snippet-1': 'Book_snippet_case_studies_example_1.png',
  'nanobanana-snippet-2': 'Book_snippet_how_to_change_camera_angle.png',
  'nanobanana-snippet-3': 'Book_snippet_multiple_use_case_for_inspiration_2.png',
  'KelasGPT_NanoBanana/Book_snippet_case_studies_example_1.png': 'Book_snippet_case_studies_example_1.png',
  'KelasGPT_NanoBanana/Book_snippet_how_to_change_camera_angle.png': 'Book_snippet_how_to_change_camera_angle.png',
  'KelasGPT_NanoBanana/Book_snippet_multiple_use_case_for_inspiration_2.png': 'Book_snippet_multiple_use_case_for_inspiration_2.png',

  // --- Ebook Mockup ---
  '001_eBook_Mockup.png': '001_eBook_Mockup_v2.png',

  // --- Misc (Newly Added) ---
  'nanobanana-maggi-before': 'Maggi Goreng.jpg',
  'KelasGPT_NanoBanana/Maggi%20Goreng.jpg': 'Maggi Goreng.jpg',
};

// Items missing from the new GitHub list - Mapped to original ImageKit URL as fallback
const MISSING_ITEMS_FALLBACK = {
};

/**
 * Get the GitHub raw URL for a given image src
 * @param {string} src - The image identifier or path
 * @returns {string} The full GitHub raw URL
 */
export function getGitImageUrl(src) {
  // Handle direct HTTP/HTTPS URLs (pass through)
  if (src.startsWith('http')) return src;

  // Try to find in main mapping
  let fileName = GIT_IMAGE_MAPPING[src];
  
  // Try decoding if not found (for paths with %20)
  if (!fileName) {
    fileName = GIT_IMAGE_MAPPING[decodeURIComponent(src)];
  }

  if (fileName) {
    return `${GITHUB_BASE_URL}/${encodeURIComponent(fileName)}`;
  }

  // Check fallbacks for missing items
  const fallbackPath = MISSING_ITEMS_FALLBACK[src] || MISSING_ITEMS_FALLBACK[decodeURIComponent(src)];
  if (fallbackPath) {
    return `${IMAGEKIT_FALLBACK_BASE_URL}/${fallbackPath}`;
  }

  // If no map found, return src. 
  // If it's a relative path starting with 'KelasGPT_NanoBanana', it likely won't work without the base URL.
  // We'll try to guess it's a file name if it ends with extensions.
  if (src.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
      // It's likely a file path. Since we are moving to GitHub, 
      // let's try to strip the folder and see if it works, or just return as is.
      // But safer to assume if it wasn't in our map, we don't know where it is.
      return src; 
  }

  return src;
}

/**
 * Loader function for Next.js Image component
 */
export default function gitImageLoader({ src, width, quality }) {
  return getGitImageUrl(src);
}

/**
 * Generate base64 data URL for blur placeholder
 * Using the same generic placeholder as imagekit.js to maintain consistency
 */
export function getBlurDataURL(imageId) {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfa";
}
