import { supabase } from './supabase';
import type { Product, Category, Brand, Review } from '../types';

export interface ProductFilters {
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  search?: string;
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'discount';
  page?: number;
  pageSize?: number;
}

const PRODUCT_SELECT = `
  *,
  product_images(id, url, sort_order, alt_text),
  categories(id, name, slug),
  brands(id, name, slug)
`;

export async function fetchProducts(filters: ProductFilters = {}) {
  const {
    categorySlug, brandSlugs, minPrice, maxPrice, minRating,
    inStockOnly, search, sort = 'featured', page = 1, pageSize = 12,
  } = filters;

  let query = supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' }).eq('status', 'published');

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (brandSlugs && brandSlugs.length > 0) {
    const { data: brands } = await supabase.from('brands').select('id').in('slug', brandSlugs);
    if (brands) query = query.in('brand_id', brands.map((b) => b.id));
  }
  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);
  if (minRating !== undefined) query = query.gte('rating', minRating);
  if (inStockOnly) query = query.gt('stock', 0);
  if (search) query = query.ilike('name', `%${search}%`);

  switch (sort) {
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: (data ?? []) as unknown as Product[], total: count ?? 0 };
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`${PRODUCT_SELECT}, product_variants(*)`)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) return null;
  return data as unknown as Product;
}

export async function fetchRelatedProducts(categoryId: string | null, excludeId: string) {
  if (!categoryId) return [];
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .eq('status', 'published')
    .limit(4);
  return (data ?? []) as unknown as Product[];
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').eq('is_visible', true).order('sort_order');
  if (error) throw error;
  return data as Category[];
}

// 🔥 UPDATED: Category-specific brands fetch karein
export async function fetchBrands(categorySlug?: string) {
  let query = supabase
    .from('products')
    .select('brand_id, brands(id, name, slug)')
    .eq('status', 'published')
    .eq('is_active', true);

  // Agar category slug diya hai toh filter apply karein
  if (categorySlug) {
    // Pehle category id dhoondhein
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    if (category) {
      query = query.eq('category_id', category.id);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  // Unique brands extract karein
  const uniqueBrands = [...new Map(
    data?.map(item => [item.brands.id, item.brands])
  ).values()];

  return uniqueBrands as Brand[];
}

export async function fetchProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as (Review & { profiles: { full_name: string | null } })[];
}

export async function submitReview(productId: string, userId: string, rating: number, comment: string) {
  const { error } = await supabase
    .from('reviews')
    .insert({ product_id: productId, user_id: userId, rating, comment });
  return { error: error?.message ?? null };
}

/** Places an order via the server-side `place_order` Postgres function.
 * Prices/stock are re-validated in the database — never trusted from the client. */
export async function placeOrder(
  items: { product_id: string; quantity: number; variant_id?: string | null }[],
  shippingAddress: Record<string, unknown>,
  couponCode: string | null,
  paymentMethod: 'cod' | 'card'
) {
  const { data, error } = await supabase.rpc('place_order', {
    p_items: items,
    p_shipping_address: shippingAddress,
    p_coupon_code: couponCode,
    p_payment_method: paymentMethod,
  });
  if (error) throw error;
  return data as string; // order id
}

export async function fetchMyOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as any[];
}

export async function fetchOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();
  if (error) return null;
  return data as any;
}

export async function validateCoupon(code: string) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return null;
  const now = new Date();
  if (data.starts_at && new Date(data.starts_at) > now) return null;
  if (data.expires_at && new Date(data.expires_at) < now) return null;
  if (data.usage_limit && data.usage_count >= data.usage_limit) return null;
  return data;
}