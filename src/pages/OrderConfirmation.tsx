import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderById } from '../lib/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => { if (id) fetchOrderById(id).then(setOrder); }, [id]);

  return (
    <div className="container" style={{ padding: '64px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Order confirmed</h1>
      <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20 }}>
        {order ? `Your order ${order.order_number} has been placed.` : 'Your order has been placed.'} We'll email you updates as it ships.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {id && <Link to={`/account/orders/${id}`} className="btn btn-primary">Track order</Link>}
        <Link to="/" className="btn btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
