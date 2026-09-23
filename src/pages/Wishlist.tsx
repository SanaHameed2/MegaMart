// src/pages/Wishlist.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useWishlist } from '../store/wishlist';
import { useCart } from '../store/cart';

const formatPKR = (amount: number) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'Rs. —';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(n);
};

export default function Wishlist() {
  const { user } = useAuth();
  const { items, removeItem } = useWishlist();
  const addItem = useCart((s) => s.addItem);

  const [processing, setProcessing] = useState<string | null>(null);
  const [movedId, setMovedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-7xl mb-6">💖</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Save products you love to find them here later.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#008ECC] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleMoveToCart(item: any) {
    if (processing === item.productId) return;
    setProcessing(item.productId);

    try {
      await addItem(
        {
          productId: item.productId,
          slug: item.slug,
          quantity: 1,
          name: item.name,
          price: item.price,
          image: item.image,
          stock: item.stock,
        },
        user?.id ?? null
      );

      await removeItem(item.productId, user?.id ?? null);

      setMovedId(item.productId);
      setTimeout(() => setMovedId(null), 2000);
    } catch (err) {
      console.error('Move to cart failed:', err);
    } finally {
      setProcessing(null);
    }
  }

  async function handleRemove(item: any) {
    if (processing === item.productId) return;
    setProcessing(item.productId);
    try {
      await removeItem(item.productId, user?.id ?? null);
    } catch (err) {
      console.error('Remove failed:', err);
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Wishlist</span>
        </nav>

        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Heart className="text-[#C0392B] fill-[#C0392B]" size={32} />
              My Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1" aria-live="polite">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#008ECC] hover:text-[#0077B6] font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const outOfStock = item.stock <= 0;
            const isProcessing = processing === item.productId;
            const wasMoved = movedId === item.productId;

            return (
              <div
                key={item.productId}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all ${
                  wasMoved ? 'border-green-200 bg-green-50' : 'hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/products/${item.slug || item.productId}`}
                    className="w-full sm:w-24 h-24 bg-[#F3F3EE] rounded-xl overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={item.image || '/assets/placeholder-product.svg'}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/placeholder-product.svg';
                      }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.slug || item.productId}`}
                      className="font-semibold text-gray-800 hover:text-[#008ECC] line-clamp-2 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-lg font-bold text-[#008ECC] mt-2">
                      {formatPKR(item.price)}
                    </p>
                    {outOfStock && (
                      <p className="text-xs text-[#C0392B] mt-1 bg-red-50 px-2 py-1 rounded inline-block font-medium">
                        Out of stock
                      </p>
                    )}
                    {wasMoved && (
                      <p className="text-xs text-[#249B3E] mt-1 bg-green-50 px-2 py-1 rounded inline-flex items-center gap-1 font-medium">
                        <Check size={12} strokeWidth={3} />
                        Moved to cart
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col justify-between items-end gap-3 flex-shrink-0">
                    <button
                      type="button"
                      disabled={outOfStock || isProcessing}
                      onClick={() => handleMoveToCart(item)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all min-h-[44px] ${
                        outOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isProcessing
                          ? 'bg-gray-100 text-gray-400 cursor-wait'
                          : 'bg-[#008ECC] text-white hover:bg-[#0077B6] shadow-sm hover:shadow-md'
                      }`}
                    >
                      <ShoppingBag size={14} />
                      {outOfStock
                        ? 'Out of Stock'
                        : isProcessing
                        ? 'Moving...'
                        : 'Move to Cart'}
                    </button>

                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from wishlist`}
                      disabled={isProcessing}
                      onClick={() => handleRemove(item)}
                      className="text-xs text-[#C0392B] hover:text-[#A93226] flex items-center gap-1 transition-colors min-h-[44px] px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}