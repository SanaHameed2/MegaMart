import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState<{
    revenue: number; orderCount: number; customerCount: number; productCount: number;
    lowStock: { id: string; name: string; stock: number }[];
    recentOrders: any[];
  } | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: orders }, { count: customerCount }, { count: productCount }, { data: lowStock }, { data: recentOrders }] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('id, name, stock').lte('stock', 5).order('stock'),
        supabase.from('orders').select('id, order_number, total, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);
      const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
      setStats({
        revenue, orderCount: orders?.length ?? 0, customerCount: customerCount ?? 0, productCount: productCount ?? 0,
        lowStock: lowStock ?? [], recentOrders: recentOrders ?? [],
      });
    }
    load();
  }, []);

  if (!stats) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard label="Revenue" value={`Rs. ${stats.revenue.toLocaleString()}`} />
        <StatCard label="Orders" value={String(stats.orderCount)} />
        <StatCard label="Customers" value={String(stats.customerCount)} />
        <StatCard label="Products" value={String(stats.productCount)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Recent orders</h2>
          {stats.recentOrders.length === 0 ? <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>No orders yet.</p> : (
            <div style={{ display: 'grid', gap: 8 }}>
              {stats.recentOrders.map((o) => (
                <Link key={o.id} to="/admin/orders" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{o.order_number}</span>
                  <span>Rs. {Number(o.total).toLocaleString()} · {o.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Low stock alerts</h2>
          {stats.lowStock.length === 0 ? <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>All products are well stocked.</p> : (
            <div style={{ display: 'grid', gap: 8 }}>
              {stats.lowStock.map((p) => (
                <Link key={p.id} to="/admin/products" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{p.name}</span>
                  <span className="badge badge-stock-low">{p.stock} left</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
