// src/pages/account/OrderDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Check, Truck, Home as HomeIcon, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { fetchOrderById } from '../../lib/api';
import { useAuth } from '../../store/auth';
import { ErrorState } from '../../components/States';

const TIMELINE = [
  { key: 'confirmed',  label: 'Confirmed',  icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'packed',     label: 'Packed',     icon: Package },
  { key: 'shipped',    label: 'Shipped',    icon: Truck },
  { key: 'delivered',  label: 'Delivered',  icon: HomeIcon },
];

function parseAddress(raw: any): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return null;
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id || !user?.id) return;
    setError(null);
    try {
      const data = await fetchOrderById(id, user.id);
      setOrder(data);
    } catch {
      setError('Could not load this order.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  if (order === undefined) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse" aria-busy="true">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order not found</h2>
        <p className="text-gray-500 mb-6">This order doesn't exist or you don't have access to it.</p>
        <Link to="/account/orders" className="text-[#008ECC] font-semibold hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const cancelled = order.status === 'cancelled' || order.status === 'refunded';
  const currentIndex = TIMELINE.findIndex((t) => t.key === order.status);
  const address = parseAddress(order.shipping_address);

  const subtotal = Number(order.subtotal ?? 0);
  const discount = Number(order.discount ?? 0);
  const shipping = Number(order.shipping ?? 0);
  const tax = Number(order.tax ?? 0);
  const total = Number(order.total ?? 0);

  return (
    <div className="space-y-6">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-[#008ECC] hover:text-[#0077B6] font-semibold transition-colors"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Package className="text-[#008ECC]" size={28} />
          Order {order.order_number}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Placed on {new Date(order.created_at).toLocaleString('en-PK', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
        {!cancelled ? (
          <div className="flex overflow-x-auto pb-2">
            {TIMELINE.map((step, i) => {
              const Icon = step.icon;
              const reached = i <= currentIndex;
              return (
                <div key={step.key} className="flex-1 text-center min-w-[100px] relative">
                  {i < TIMELINE.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 right-0 h-0.5 ${
                        i < currentIndex ? 'bg-[#008ECC]' : 'bg-gray-200'
                      }`}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center transition-all ${
                      reached
                        ? 'bg-[#008ECC] text-white shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <p className={`text-xs font-semibold ${reached ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-lg font-bold text-[#C0392B] capitalize">
              Order {order.status}
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#008ECC] rounded-full"></span>
          Items ({order.order_items?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {order.order_items?.map((item: any) => {
            const unitPrice = Number(item.unit_price ?? 0);
            const qty = Number(item.quantity ?? 0);
            const lineTotal = unitPrice * qty;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Rs. {unitPrice.toLocaleString()} × {qty}
                  </p>
                </div>
                <p className="font-bold text-sm text-gray-800 flex-shrink-0 ml-3">
                  Rs. {lineTotal.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#008ECC]" />
            Shipping Address
          </h2>
          {address ? (
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">{address.full_name}</span>
              <br />
              {address.line1}
              <br />
              {[address.city, address.state, address.postal_code].filter(Boolean).join(', ')}
              <br />
              {address.phone}
            </p>
          ) : (
            <p className="text-sm text-gray-500">No address</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#008ECC]" />
            Payment
          </h2>
          <p className="text-sm text-gray-700">
            Method:{' '}
            <span className="font-semibold">
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}
            </span>
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Status:{' '}
            <span className={`font-semibold capitalize ${
              order.payment_status === 'paid' ? 'text-[#249B3E]' : 'text-amber-600'
            }`}>
              {order.payment_status}
            </span>
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#008ECC] rounded-full"></span>
          Order Summary
        </h2>
        <div className="space-y-2">
          <SummaryRow label="Subtotal" value={subtotal} />
          {discount > 0 && <SummaryRow label="Discount" value={-discount} negative />}
          <SummaryRow label="Shipping" value={shipping} />
          {tax > 0 && <SummaryRow label="Tax" value={tax} />}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <SummaryRow label="Total" value={total} bold />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label, value, bold, negative,
}: { label: string; value: number; bold?: boolean; negative?: boolean }) {
  return (
    <div className={`flex justify-between items-baseline ${bold ? 'text-lg' : 'text-sm'}`}>
      <span className={bold ? 'font-bold text-gray-800' : 'text-gray-600'}>{label}</span>
      <span className={`${bold ? 'font-bold text-gray-800' : 'font-medium'} ${
        negative ? 'text-[#249B3E]' : 'text-gray-700'
      }`}>
        Rs. {Number(value).toLocaleString()}
      </span>
    </div>
  );
}