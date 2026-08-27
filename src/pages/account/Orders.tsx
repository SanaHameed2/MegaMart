import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { fetchMyOrders } from '../../lib/api';
import { EmptyState, ErrorState } from '../../components/States';

const STATUS_COLORS: Record<string, string> = {
  pending: '#7A5D00', confirmed: '#1B4332', processing: '#1B4332',
  packed: '#1B4332', shipped: '#0B5394', delivered: '#1B4332',
  cancelled: '#C0392B', refunded: '#C0392B',
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
  useEffect(() => { load(); }, [user?.id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (orders === null) return <p>Loading…</p>;
  if (orders.length === 0) return <EmptyState title="No orders yet" message="Your order history will show up here." actionLabel="Start shopping" actionTo="/" />;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Your orders</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {orders.map((o) => (
          <Link key={o.id} to={`/account/orders/${o.id}`} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{o.order_number}</p>
              <p style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>{new Date(o.created_at).toLocaleDateString()} · {o.order_items?.length ?? 0} items</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700 }}>Rs. {Number(o.total).toLocaleString()}</p>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize', color: STATUS_COLORS[o.status] }}>{o.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
