import { useEffect, useState } from 'react';
import { useAuth } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import type { Address } from '../../types';
import { EmptyState } from '../../components/States';

const empty = { full_name: '', phone: '', line1: '', city: '', state: '', postal_code: '', country: 'Pakistan' };

export default function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data ?? []);
  }
  useEffect(() => { load(); }, [user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (editingId) {
      await supabase.from('addresses').update(form).eq('id', editingId);
    } else {
      await supabase.from('addresses').insert({ ...form, user_id: user.id, is_default: addresses.length === 0 });
    }
    setForm(empty);
    setShowForm(false);
    setEditingId(null);
    load();
  }

  async function setDefault(id: string) {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    await supabase.from('addresses').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Addresses</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(empty); setEditingId(null); setShowForm(true); }}>Add address</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 20, display: 'grid', gap: 10, maxWidth: 480 }}>
          {(['full_name', 'phone', 'line1', 'city', 'state', 'postal_code'] as const).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="label" style={{ textTransform: 'capitalize' }}>{field.replace('_', ' ')}</label>
              <input id={field} required className="input" value={(form as any)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary">Save address</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState title="No saved addresses" message="Add an address to speed up checkout." />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {addresses.map((a) => (
            <div key={a.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{a.full_name} {a.is_default && <span className="badge" style={{ background: 'var(--color-primary)', color: '#fff', marginLeft: 6 }}>Default</span>}</p>
                <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{a.line1}, {a.city}, {a.state} {a.postal_code}</p>
                <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{a.phone}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                {!a.is_default && <button className="btn btn-outline btn-sm" onClick={() => setDefault(a.id)}>Set default</button>}
                <button className="btn btn-outline btn-sm" onClick={() => { setForm(a as any); setEditingId(a.id); setShowForm(true); }}>Edit</button>
                <button className="btn btn-outline btn-sm" onClick={() => remove(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
