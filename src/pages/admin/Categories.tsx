import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await supabase.from('categories').insert({
      name, slug, parent_id: parentId || null, sort_order: categories.length,
    });
    if (error) { setMsg(error.message); return; }
    setName(''); setParentId('');
    load();
  }

  async function toggleVisible(c: Category) {
    await supabase.from('categories').update({ is_visible: !c.is_visible }).eq('id', c.id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Categories</h1>

      <form onSubmit={handleCreate} className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label className="label" htmlFor="cat-name">Name</label>
          <input id="cat-name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="cat-parent">Parent category</label>
          <select id="cat-parent" className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">None (top-level)</option>
            {categories.filter((c) => !c.parent_id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary">Add category</button>
        {msg && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{msg}</p>}
      </form>

      <div style={{ display: 'grid', gap: 8 }}>
        {categories.map((c) => (
          <div key={c.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14, paddingLeft: c.parent_id ? 20 : 0 }}>{c.parent_id ? '— ' : ''}{c.name}</span>
            <span className="badge" style={{ background: c.is_visible ? '#DCEFE4' : '#F0F0EC', color: c.is_visible ? 'var(--color-primary)' : 'var(--color-ink-soft)' }}>
              {c.is_visible ? 'Visible' : 'Hidden'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => toggleVisible(c)}>{c.is_visible ? 'Hide' : 'Show'}</button>
            <button className="btn btn-outline btn-sm" onClick={() => remove(c.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
