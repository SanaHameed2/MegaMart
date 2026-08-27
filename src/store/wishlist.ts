import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  hydrate: (userId: string | null) => Promise<void>;
  toggle: (item: WishlistItem, userId: string | null) => Promise<'added' | 'removed' | 'needs-auth'>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  hydrate: async (userId) => {
    if (!userId) {
      set({ items: [] });
      return;
    }
    set({ loading: true });
    const { data } = await supabase
      .from('wishlist_items')
      .select('product_id, products(id, name, price, stock, product_images(url, sort_order))')
      .eq('user_id', userId);

    const items: WishlistItem[] = (data ?? []).map((row: any) => ({
      productId: row.products.id,
      name: row.products.name,
      price: row.products.price,
      stock: row.products.stock,
      image: row.products.product_images?.[0]?.url ?? null,
    }));
    set({ items, loading: false });
  },

  toggle: async (item, userId) => {
    if (!userId) return 'needs-auth';
    const isIn = get().items.some((i) => i.productId === item.productId);
    if (isIn) {
      await supabase.from('wishlist_items').delete().eq('user_id', userId).eq('product_id', item.productId);
      set({ items: get().items.filter((i) => i.productId !== item.productId) });
      return 'removed';
    }
    await supabase.from('wishlist_items').insert({ user_id: userId, product_id: item.productId });
    set({ items: [...get().items, item] });
    return 'added';
  },

  isWishlisted: (productId) => get().items.some((i) => i.productId === productId),
}));
