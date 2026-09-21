// src/lib/categoryImages.ts
// ============================================================
// Shared category image mapping (slug → public asset)
// Used by Categories.tsx, TopCategoriesSection.tsx, DailyEssentialsSection.tsx
// ------------------------------------------------------------
// All filenames use the exact case on disk (Linux/Vercel safe).
// TODO: migrate to categories.image_url column so new categories
//       don't require a code deploy.
// ============================================================

export const CATEGORY_IMAGES: Record<string, string> = {
  // Top-level
  'electronics': '/assets/images/electronics.png',
  'fashion': '/assets/images/cosmetics.png',
  'home-kitchen': '/assets/images/furniture.png',
  'groceries': '/assets/images/fruits.png',
  'beauty': '/assets/images/cosmetics.png',
  'home-improvement': '/assets/images/Decor.png',
  'sports-toys-luggage': '/assets/images/Accessories.png',
  'premium-fruits': '/assets/images/fruits.png',

  // Children
  'smartphones': '/assets/images/Mobile.png',
  'laptops': '/assets/images/electronics.png',
  'electronics-accessories': '/assets/images/electronics.png',
  'apparel': '/assets/images/cosmetics.png',
  'vegetables': '/assets/images/veg1.jpg',
  'fruits': '/assets/images/fruits.jpg',
  'mango': '/assets/images/mango.jpg',
  'cherry': '/assets/images/cherry.jpg',
};

export const FALLBACK_IMAGE = '/assets/images/electronics.png';

/**
 * Resolve a category image by slug with fallback.
 */
export function getCategoryImage(slug: string | null | undefined): string {
  if (!slug) return FALLBACK_IMAGE;
  return CATEGORY_IMAGES[slug] ?? FALLBACK_IMAGE;
}