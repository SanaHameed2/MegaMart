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
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[var(--color-ink)]">Categories</h1>

      {/* Category Creation Form */}
      <form onSubmit={handleCreate} className="card p-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="label" htmlFor="cat-name">Name</label>
          <input 
            id="cat-name" 
            required 
            className="input" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="label" htmlFor="cat-parent">Parent category</label>
          <select 
            id="cat-parent" 
            className="input" 
            value={parentId} 
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">None (top-level)</option>
            {categories.filter((c) => !c.parent_id).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary h-[42px] px-5">Add category</button>
        {msg && <p className="w-full text-xs text-[var(--color-danger)] mt-1">{msg}</p>}
      </form>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="card p-3.5 flex items-center gap-3">
            <span className={`flex-1 font-semibold text-sm ${c.parent_id ? 'pl-5 text-[var(--color-ink-soft)]' : 'text-[var(--color-ink)]'}`}>
              {c.parent_id ? '— ' : ''}{c.name}
            </span>

            <span className={`badge ${c.is_visible ? 'bg-[#DCEFE4] text-[var(--color-primary)]' : 'bg-[#F0F0EC] text-[var(--color-ink-soft)]'}`}>
              {c.is_visible ? 'Visible' : 'Hidden'}
            </span>

            <button className="btn btn-outline btn-sm" onClick={() => toggleVisible(c)}>
              {c.is_visible ? 'Hide' : 'Show'}
            </button>
            <button className="btn btn-outline btn-sm hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]" onClick={() => remove(c.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}