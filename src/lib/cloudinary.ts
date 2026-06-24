/**
 * Utility functions for Cloudinary image transformations.
 * Optimizes image size, quality, and format dynamically.
 */

/**
 * Returns optimized image URL for product listings (width 500px, auto quality, auto format)
 */
export function getProductCardImage(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg";
  if (!url.includes("res.cloudinary.com")) return url; // Fallback for local/seeded URLs during transition
  
  // Replace '/upload/' with '/upload/f_auto,q_auto,w_500/'
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_500/");
}

/**
 * Returns optimized image URL for product detail pages (width 1000px, auto quality, auto format)
 */
export function getProductDetailImage(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg";
  if (!url.includes("res.cloudinary.com")) return url;
  
  // Replace '/upload/' with '/upload/f_auto,q_auto,w_1000/'
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1000/");
}

/**
 * Returns optimized image URL for thumbnails (width 150px, auto quality, auto format)
 */
export function getProductThumbnailImage(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg";
  if (!url.includes("res.cloudinary.com")) return url;
  
  // Replace '/upload/' with '/upload/f_auto,q_auto,w_150/'
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_150/");
}
