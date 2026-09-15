// src/lib/normalizers.ts

// ============================================================
// RAW pg_graphql TYPES
// ============================================================
// These match the exact shape returned by the live schema.
// Verified via Thunder Client:
//   - Field names: snake_case (compare_at_price, review_count, sort_order)
//   - brands / categories: flat objects (many-to-one)
//   - product_imagesCollection: Relay Collection pattern (one-to-many)
//   - price, compare_at_price, rating: STRING (e.g. "289999.00", "4.6")
//   - specifications: JSON STRING (e.g. "{\"Storage\":\"128GB\"}")
// ============================================================

export interface RawImage {
  id: string;
  url: string;
  sort_order: number;
}

export interface RawBrand {
  id: string;
  name: string;
  slug: string;
}

export interface RawCategory {
  id: string;
  name: string;
  slug: string;
}

export interface RawProductNode {
  id: string;
  nodeId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: string;                          // ⚠️ STRING from pg_graphql
  compare_at_price?: string | null;       // ⚠️ STRING
  stock: number;
  rating?: string | null;                 // ⚠️ STRING
  review_count?: number | null;
  sku?: string | null;
  category_id?: string | null;
  specifications?: string | null;         // ⚠️ JSON STRING
  brands?: RawBrand | null;               // flat object (many-to-one)
  categories?: RawCategory | null;        // flat object (many-to-one)
  product_imagesCollection?: {
    edges: Array<{ node: RawImage }>;
  } | null;
}

// ============================================================
// NORMALIZED TYPES (for React components)
// ============================================================

export interface NormalizedImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface NormalizedBrand {
  id: string;
  name: string;
  slug: string;
}

export interface NormalizedCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  nodeId: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;                          // display-only
  compareAtPrice: number | null;          // display-only
  stock: number;
  rating: number;                         // display-only
  reviewCount: number;
  sku: string | null;
  categoryId: string | null;
  specifications: Record<string, unknown>;
  images: NormalizedImage[];
  /** First image URL or placeholder — handy for cards/lists */
  primaryImage: string;
  brands: NormalizedBrand | null;
  categories: NormalizedCategory | null;
}

// ============================================================
// NORMALIZER
// ============================================================

const PLACEHOLDER_IMAGE = '/assets/placeholder-product.svg';

/**
 * Convert a raw pg_graphql `products` node into a clean, typed Product
 * for consumption by React components.
 *
 * ⚠️ IMPORTANT — MONEY HANDLING:
 *   `price` and `compareAtPrice` here are `Number` **for display only**.
 *   Do NOT use these floats for cart subtotal / discount / tax math —
 *   floating point will drift on large sums.
 *   For any arithmetic, use integer cents:
 *     const priceCents = Math.round(Number(raw.price) * 100);
 */
export function normalizeProduct(rawNode: RawProductNode): Product {
  // ---- price ----
  const price = Number(rawNode.price) || 0;
  const compareAtPrice =
    rawNode.compare_at_price != null && rawNode.compare_at_price !== ''
      ? Number(rawNode.compare_at_price)
      : null;

  // ---- rating ----
  const rating = rawNode.rating != null ? Number(rawNode.rating) || 0 : 0;

  // ---- specifications (JSON string → object) ----
  let specifications: Record<string, unknown> = {};
  if (rawNode.specifications) {
    try {
      const parsed =
        typeof rawNode.specifications === 'string'
          ? JSON.parse(rawNode.specifications)
          : rawNode.specifications;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        specifications = parsed as Record<string, unknown>;
      }
    } catch (err) {
      console.warn(
        `[normalizeProduct] Failed to parse specifications for product ${rawNode.id}:`,
        err
      );
      // fall through — specifications stays {}
    }
  }

  // ---- images (Collection → flat sorted array) ----
  const images: NormalizedImage[] = (rawNode.product_imagesCollection?.edges ?? [])
    .map((edge) => ({
      id: edge.node.id,
      url: edge.node.url,
      sortOrder: edge.node.sort_order ?? 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const primaryImage = images[0]?.url || PLACEHOLDER_IMAGE;

  // ---- brands / categories (flat objects, pass through) ----
  const brands: NormalizedBrand | null = rawNode.brands
    ? {
        id: rawNode.brands.id,
        name: rawNode.brands.name,
        slug: rawNode.brands.slug,
      }
    : null;

  const categories: NormalizedCategory | null = rawNode.categories
    ? {
        id: rawNode.categories.id,
        name: rawNode.categories.name,
        slug: rawNode.categories.slug,
      }
    : null;

  return {
    id: rawNode.id,
    nodeId: rawNode.nodeId ?? null,
    name: rawNode.name,
    slug: rawNode.slug,
    description: rawNode.description ?? '',
    price,
    compareAtPrice,
    stock: rawNode.stock ?? 0,
    rating,
    reviewCount: rawNode.review_count ?? 0,
    sku: rawNode.sku ?? null,
    categoryId: rawNode.category_id ?? null,
    specifications,
    images,
    primaryImage,
    brands,
    categories,
  };
}

/**
 * Convenience helper: extract the array of raw nodes from an Apollo
 * `productsCollection` response, then normalize each one.
 *
 * Usage:
 *   const products = normalizeProductsCollection(data?.productsCollection);
 */
export function normalizeProductsCollection(
  collection:
    | { edges?: Array<{ node: RawProductNode }> | null }
    | null
    | undefined
): Product[] {
  const edges = collection?.edges ?? [];
  return edges.map((edge) => normalizeProduct(edge.node));
}