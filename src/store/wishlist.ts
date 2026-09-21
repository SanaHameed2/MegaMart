// src/store/wishlist.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ============================================================
// Types
// ============================================================
interface WishlistItem {
  productId: string;
  slug: string;          // ✅ NEW — for product page link
  name: string;
  price: number;
  image: string | null;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  hydrated: boolean;     // ✅ NEW — to prevent empty-state flash on refresh
  hydrate: (userId: string | null) => Promise<void>;
  toggle: (item: WishlistItem, userId: string | null) => Promise<'added' | 'removed' | 'needs-auth'>;
  removeItem: (productId: string, userId: string | null) => Promise<void>;  // ✅ NEW
  isWishlisted: (productId: string) => boolean;
}

// ============================================================
// Store
// ============================================================
export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  hydrated: false,

  // ----------------------------------------------------------
  // hydrate: fetch wishlist + JOIN product data for live price/stock
  // (so a stale localStorage snapshot never shows old price)
  // ----------------------------------------------------------
  hydrate: async (userId) => {
    if (!userId) {
      set({ items: [], hydrated: true });
      return;
    }

    set({ loading: true });

    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        product_id,
        products (
          id,
          name,
          slug,
          price,
          stock,
          product_images (url, sort_order)
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[wishlist.hydrate] error:', error.message);
      set({ items: [], loading: false, hydrated: true });
      return;
    }

    const items: WishlistItem[] = (data ?? [])
      .map((row: any) => {
        const product = row.products;
        if (!product) return null;
        return {
          productId: product.id,
          slug: product.slug,                                    // ✅ live slug
          name: product.name,
          price: Number(product.price) || 0,                      // ✅ live price
          stock: Number(product.stock) || 0,                      // ✅ live stock
          image: product.product_images?.[0]?.url ?? null,
        } as WishlistItem;
      })
      .filter(Boolean) as WishlistItem[];

    set({ items, loading: false, hydrated: true });
  },

  // ----------------------------------------------------------
  // toggle: add if missing, remove if present
  // ----------------------------------------------------------
  toggle: async (item, userId) => {
    if (!userId) return 'needs-auth';

    const isIn = get().items.some((i) => i.productId === item.productId);

    if (isIn) {
      // Remove
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', item.productId);

      if (error) {
        console.error('[wishlist.toggle] delete error:', error.message);
        return 'removed';
      }

      set({ items: get().items.filter((i) => i.productId !== item.productId) });
      return 'removed';
    }

    // Add
    const { error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: userId, product_id: item.productId });

    if (error) {
      console.error('[wishlist.toggle] insert error:', error.message);
      return 'added';
    }

    set({ items: [...get().items, item] });
    return 'added';
  },

  // ----------------------------------------------------------
  // ✅ NEW: removeItem — explicit removal (used by "Move to Cart" flow)
  // ----------------------------------------------------------
  removeItem: async (productId, userId) => {
    if (!userId) return;

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('[wishlist.removeItem] error:', error.message);
      return;
    }

    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  // ----------------------------------------------------------
  isWishlisted helper
  // ----------------------------------------------------------
  isWishlisted: (productId) =>
    get().items.some((i) => i.productId === productId),
}));