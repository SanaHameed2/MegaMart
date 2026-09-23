// src/pages/account/Orders.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { fetchMyOrders } from '../../lib/api';
import { ErrorState } from '../../components/States';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Pending' },
  confirmed:  { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Confirmed' },
  processing: { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Processing' },
  packed:     { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Packed' },
  shipped:    { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Shipped' },
  delivered:  { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Delivered' },
  cancelled:  { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Cancelled' },
  refunded:   { bg: 'bg-gray-100',  text: 'text-gray-700',   label: 'Refunded' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setError(null);
    try {
      setOrders(await fetchMyOrders(user.id));
    } catch {
      setError('Could not load your orders.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  if (orders === null) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading orders">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Your order history will show up here.</p>
        <Link
          to="/"
          className="inline-block bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Package className="text-[#008ECC]" size={28} />
          Your Orders
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const status = STATUS_STYLES[o.status] ?? {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            label: o.status || 'Unknown',
          };
          const itemCount = o.order_items?.length ?? 0;
          return (
            <Link
              key={o.id}
              to={`/account/orders/${o.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#F3F3EE] flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="text-[#008ECC]" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800">{o.order_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      Rs. {Number(o.total ?? 0).toLocaleString()}
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <ChevronRight
                    className="text-gray-300 group-hover:text-[#008ECC] transition-colors"
                    size={20}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}