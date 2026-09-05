import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { CartLine } from '../types';

const GUEST_CART_KEY = 'megamart_guest_cart_v1';

function readGuestCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: CartLine[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
}

export interface CartState {
  lines: CartLine[];
  items: CartLine[]; // Alias for Header compatibility
  loading: boolean;
  hydrate: (userId: string | null) => Promise<void>;
  addItem: (line: CartLine, userId: string | null) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, userId: string | null) => Promise<void>;
  removeItem: (productId: string, userId: string | null) => Promise<void>;
  clear: (userId: string | null) => Promise<void>;
  mergeGuestCartIntoAccount: (userId: string) => Promise<void>;
  subtotal: () => number;
}

async function getOrCreateCartId(userId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (error) throw error;
  return created.id;
}

export const useCart = create<CartState>((set, get) => ({
  lines: [],
  get items() {
    return get().lines;
  },
  loading: false,

  hydrate: async (userId) => {
    set({ loading: true });
    if (!userId) {
      set({ lines: readGuestCart(), loading: false });
      return;
    }
    const cartId = await getOrCreateCartId(userId);
    const { data } = await supabase
      .from('cart_items')
      .select('quantity, variant_id, products(id, name, price, stock, product_images(url, sort_order))')
      .eq('cart_id', cartId);

    const lines: CartLine[] = (data ?? []).map((row: any) => ({
      productId: row.products.id,
      quantity: row.quantity,
      variantId: row.variant_id,
      name: row.products.name,
      price: row.products.price,
      stock: row.products.stock,
      image: row.products.product_images?.[0]?.url ?? null,
    }));
    set({ lines, loading: false });
  },

  addItem: async (line, userId) => {
    if (!userId) {
      const current = readGuestCart();
      const existing = current.find((l) => l.productId === line.productId);
      const next = existing
        ? current.map((l) =>
            l.productId === line.productId ? { ...l, quantity: l.quantity + line.quantity } : l
          )
        : [...current, line];
      writeGuestCart(next);
      set({ lines: next });
      return;
    }
    const cartId = await getOrCreateCartId(userId);
    const { data: existingRow } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', line.productId)
      .maybeSingle();

    if (existingRow) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingRow.quantity + line.quantity })
        .eq('id', existingRow.id);
    } else {
      await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: line.productId,
        quantity: line.quantity,
      });
    }
    await get().hydrate(userId);
  },

  updateQuantity: async (productId, quantity, userId) => {
    if (!userId) {
      const next = readGuestCart()
        .map((l) => (l.productId === productId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0);
      writeGuestCart(next);
      set({ lines: next });
      return;
    }
    const cartId = await getOrCreateCartId(userId);
    if (quantity <= 0) {
      await supabase.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId);
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('product_id', productId);
    }
    await get().hydrate(userId);
  },

  removeItem: async (productId, userId) => {
    await get().updateQuantity(productId, 0, userId);
  },

  clear: async (userId) => {
    if (!userId) {
      writeGuestCart([]);
      set({ lines: [] });
      return;
    }
    const cartId = await getOrCreateCartId(userId);
    await supabase.from('cart_items').delete().eq('cart_id', cartId);
    set({ lines: [] });
  },

  mergeGuestCartIntoAccount: async (userId) => {
    const guestLines = readGuestCart();
    if (guestLines.length === 0) return;
    for (const line of guestLines) {
      await get().addItem(line, userId);
    }
    writeGuestCart([]);
  },

  subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
}));