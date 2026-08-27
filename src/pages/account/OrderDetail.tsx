import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOrderById } from '../../lib/api';
import { ErrorState } from '../../components/States';

const TIMELINE: { key: string; label: string }[] = [
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    setError(null);
    try {
      setOrder(await fetchOrderById(id));
    } catch {
      setError('Could not load this order.');
    }
  }
  useEffect(() => { load(); }, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (order === undefined) return <p>Loading…</p>;
  if (order === null) return <p>Order not found.</p>;

  const cancelled = order.status === 'cancelled' || order.status === 'refunded';
  const currentIndex = TIMELINE.findIndex((t) => t.key === order.status);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Order {order.order_number}</h1>
      <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 24 }}>Placed on {new Date(order.created_at).toLocaleString()}</p>

      {!cancelled ? (
        <div style={{ display: 'flex', marginBottom: 32, overflowX: 'auto' }}>
          {TIMELINE.map((step, i) => (
            <div key={step.key} style={{ flex: 1, textAlign: 'center', minWidth: 100 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', margin: '0 auto 6px',
                background: i <= currentIndex ? 'var(--color-primary)' : '#E4E4DC',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>
                {i <= currentIndex ? '✓' : ''}
              </div>
              <p style={{ fontSize: 11, color: i <= currentIndex ? 'var(--color-ink)' : 'var(--color-ink-soft)' }}>{step.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--color-danger)', fontWeight: 700, marginBottom: 24, textTransform: 'capitalize' }}>{order.status}</p>
      )}

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Items</h2>
        {order.order_items?.map((item: any) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: '1px solid var(--color-border)' }}>
            <span>{item.product_name} × {item.quantity}</span>
            <span>Rs. {(item.unit_price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Summary</h2>
        <SummaryRow label="Subtotal" value={order.subtotal} />
        <SummaryRow label="Discount" value={-order.discount} />
        <SummaryRow label="Shipping" value={order.shipping} />
        <SummaryRow label="Total" value={order.total} bold />
        <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 12 }}>
          Payment method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'} · Payment status: {order.payment_status}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, marginBottom: 6 }}>
      <span>{label}</span><span>Rs. {Number(value).toLocaleString()}</span>
    </div>
  );
}
