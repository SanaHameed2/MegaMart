import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles(full_name)')
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Orders</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        {orders.length === 0 && <p style={{ color: 'var(--color-ink-soft)' }}>No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="card" style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div style={{ minWidth: 140 }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{o.order_number}</p>
              <p style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>{o.profiles?.full_name || 'Customer'} · {new Date(o.created_at).toLocaleDateString()}</p>
            </div>
            <p style={{ fontSize: 13, flex: 1 }}>{o.order_items?.length ?? 0} items</p>
            <p style={{ fontWeight: 700 }}>Rs. {Number(o.total).toLocaleString()}</p>
            <span style={{ fontSize: 12 }}>Payment: {o.payment_status}</span>
            <select className="input" style={{ width: 150 }} value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
