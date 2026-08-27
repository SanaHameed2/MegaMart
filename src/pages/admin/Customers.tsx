import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, phone, created_at, is_admin');
      const { data: orders } = await supabase.from('orders').select('user_id, total');
      const spendByUser: Record<string, { total: number; count: number }> = {};
      (orders ?? []).forEach((o) => {
        if (!spendByUser[o.user_id]) spendByUser[o.user_id] = { total: 0, count: 0 };
        spendByUser[o.user_id].total += Number(o.total);
        spendByUser[o.user_id].count += 1;
      });
      setCustomers((profiles ?? []).map((p) => ({ ...p, spend: spendByUser[p.id]?.total ?? 0, orderCount: spendByUser[p.id]?.count ?? 0 })));
    }
    load();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Customers</h1>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#F5F5F0', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Phone</th>
              <th style={{ padding: 12 }}>Joined</th>
              <th style={{ padding: 12 }}>Orders</th>
              <th style={{ padding: 12 }}>Total spend</th>
              <th style={{ padding: 12 }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: 12 }}>{c.full_name || '—'}</td>
                <td style={{ padding: 12 }}>{c.phone || '—'}</td>
                <td style={{ padding: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                <td style={{ padding: 12 }}>{c.orderCount}</td>
                <td style={{ padding: 12 }}>Rs. {c.spend.toLocaleString()}</td>
                <td style={{ padding: 12 }}>{c.is_admin ? 'Admin' : 'Customer'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 12 }}>
        Emails are intentionally not shown here to limit exposure of personal data in the admin UI.
      </p>
    </div>
  );
}
