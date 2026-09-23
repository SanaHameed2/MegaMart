// src/pages/Cart.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/auth';
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

const SHIPPING_FLAT = 150;

export default function Cart() {
  const { user } = useAuth();
  const { lines, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const sub = subtotal();
  const shipping = SHIPPING_FLAT;
  const total = sub + shipping;
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const hasStockIssue = lines.some((l) => l.stock <= 0 || l.quantity > l.stock);

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Discover products you'll love.</p>
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

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Shopping Cart</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingBag className="text-[#008ECC]" size={32} />
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {hasStockIssue && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Some items in your cart have stock issues
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Please adjust quantities or remove out-of-stock items before checkout.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            {lines.map((line) => {
              const lineTotal = line.price * line.quantity;
              const outOfStock = line.stock <= 0;
              const insufficientStock = !outOfStock && line.quantity > line.stock;
              const atMin = line.quantity <= 1;
              const atMax = line.quantity >= line.stock;

              return (
                <div
                  key={line.productId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to={`/products/${line.slug || line.productId}`}
                      className="w-full sm:w-24 h-24 bg-[#F3F3EE] rounded-xl overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={line.image || '/assets/placeholder-product.svg'}
                        alt={line.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/placeholder-product.svg';
                        }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${line.slug || line.productId}`}
                        className="font-semibold text-gray-800 hover:text-[#008ECC] line-clamp-2 transition-colors"
                      >
                        {line.name}
                      </Link>
                      <p className="text-lg font-bold text-[#008ECC] mt-2">
                        {formatPKR(line.price)}
                      </p>
                      {outOfStock && (
                        <p className="text-xs text-[#C0392B] mt-1 bg-red-50 px-2 py-1 rounded inline-block font-medium">
                          Out of stock — remove to continue
                        </p>
                      )}
                      {insufficientStock && (
                        <p className="text-xs text-[#C0392B] mt-1 bg-red-50 px-2 py-1 rounded inline-block">
                          Only {line.stock} left in stock
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col justify-between items-end gap-3">
                      <div className="inline-flex items-center bg-[#FAFAF7] border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.name}`}
                          disabled={atMin || outOfStock}
                          onClick={() =>
                            updateQuantity(line.productId, line.quantity - 1, user?.id ?? null)
                          }
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span aria-live="polite" className="w-10 text-center font-semibold text-sm">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.name}`}
                          disabled={atMax || outOfStock}
                          onClick={() =>
                            updateQuantity(line.productId, line.quantity + 1, user?.id ?? null)
                          }
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-800">{formatPKR(lineTotal)}</p>
                        <button
                          type="button"
                          aria-label={`Remove ${line.name} from cart`}
                          onClick={() => removeItem(line.productId, user?.id ?? null)}
                          className="text-xs text-[#C0392B] hover:text-[#A93226] flex items-center gap-1 mt-1 ml-auto transition-colors"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-[#008ECC] hover:text-[#0077B6] font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#008ECC] rounded-full"></span>
                Order Summary
              </h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                <Row label="Subtotal" value={sub} />
                <Row label="Shipping" value={shipping} />
              </div>

              <Row label="Total" value={total} bold large />

              <button
                type="button"
                disabled={hasStockIssue}
                onClick={() => navigate(user ? '/checkout' : '/login?redirect=/checkout')}
                className={`w-full mt-6 py-4 rounded-xl font-semibold transition-colors shadow-md flex items-center justify-center gap-2 ${
                  hasStockIssue
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[#008ECC] text-white hover:bg-[#0077B6] hover:shadow-lg'
                }`}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              {hasStockIssue && (
                <p className="text-xs text-[#C0392B] text-center mt-2">
                  Fix stock issues to proceed
                </p>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={16} className="text-[#249B3E]" />
                Secure checkout — 100% safe
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  large,
}: {
  label: string;
  value: number;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={`text-sm ${bold ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
        {label}
      </span>
      <span
        className={`${large ? 'text-xl' : 'text-sm'} ${
          bold ? 'font-bold text-gray-800' : 'font-medium text-gray-700'
        }`}
      >
        {formatPKR(value)}
      </span>
    </div>
  );
}