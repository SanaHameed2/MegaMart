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
  // ---------- Top-level ----------
  'premium-fruits': '/assets/images/fruits.png',
  'electronics': '/assets/images/Mobile.png',            // ✅ phone (not washing machine)
  'fashion': '/assets/images/Accessories.png',           // ✅ accessories (necklace)
  'home-kitchen': '/assets/images/furniture.png',        // ✅ sofa
  'groceries': '/assets/images/fruits.jpg',              // ✅ fruits
  'beauty': '/assets/images/cosmetics.png',              // ✅ cosmetics
  'home-improvement': '/assets/images/Decor.png',        // ✅ plant/decor
  'sports-toys-luggage': '/assets/images/watches.png',   // ⚠️ watches (temporary — add sports.png later)

  // ---------- Children ----------
  'smartphones': '/assets/images/Mobile.png',
  'laptops': '/assets/images/Mobile.png',                // ⚠️ temporary — add laptop.png later
  'electronics-accessories': '/assets/images/Accessories.png',
  'apparel': '/assets/images/cosmetics.png',
  'vegetables': '/assets/images/veg1.jpg',
  'fruits': '/assets/images/fruits.jpg',
  'mango': '/assets/images/mango.jpg',
  'cherry': '/assets/images/cherry.jpg',
};

// Neutral fallback that won't look like a specific category
export const FALLBACK_IMAGE = '/assets/images/fruits.png';

/**
 * Resolve a category image by slug with fallback.
 */
export function getCategoryImage(slug: string | null | undefined): string {
  if (!slug) return FALLBACK_IMAGE;
  return CATEGORY_IMAGES[slug] ?? FALLBACK_IMAGE;
}