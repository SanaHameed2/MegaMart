import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category, Brand } from '../../types';

const emptyForm = {
  id: '', name: '', slug: '', description: '', price: '', compare_at_price: '',
  sku: '', category_id: '', brand_id: '', stock: '', status: 'published', image_url: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const [{ data: p }, { data: c }, { data: b }] = await Promise.all([
      supabase.from('products').select('*, product_images(url), categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('brands').select('*').order('name'),
    ]);
    setProducts(p ?? []);
    setCategories(c ?? []);
    setBrands(b ?? []);
  }
  useEffect(() => { load(); }, []);

  function startCreate() { setForm(emptyForm); setShowForm(true); }
  function startEdit(p: any) {
    setForm({
      id: p.id, name: p.name, slug: p.slug, description: p.description || '',
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      sku: p.sku || '', category_id: p.category_id || '', brand_id: p.brand_id || '',
      stock: String(p.stock), status: p.status, image_url: p.product_images?.[0]?.url || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      name: form.name, slug, description: form.description,
      price: Number(form.price), compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      sku: form.sku || null, category_id: form.category_id || null, brand_id: form.brand_id || null,
      stock: Number(form.stock), status: form.status,
    };
    let productId = form.id;
    if (form.id) {
      const { error } = await supabase.from('products').update(payload).eq('id', form.id);
      if (error) { setMsg(error.message); return; }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error) { setMsg(error.message); return; }
      productId = data.id;
    }
    if (form.image_url) {
      await supabase.from('product_images').delete().eq('product_id', productId);
      await supabase.from('product_images').insert({ product_id: productId, url: form.image_url, sort_order: 0 });
    }
    setShowForm(false);
    load();
  }

  async function toggleStatus(p: any) {
    const next = p.status === 'published' ? 'archived' : 'published';
    await supabase.from('products').update({ status: next }).eq('id', p.id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Products</h1>
        <button className="btn btn-primary btn-sm" onClick={startCreate}>New product</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label" htmlFor="p-name">Name</label>
            <input id="p-name" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="p-slug">Slug (auto if blank)</label>
            <input id="p-slug" className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label" htmlFor="p-desc">Description</label>
            <textarea id="p-desc" className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="p-price">Price (Rs.)</label>
            <input id="p-price" type="number" required min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="p-compare">Compare-at price</label>
            <input id="p-compare" type="number" min="0" className="input" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="p-sku">SKU</label>
            <input id="p-sku" className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="p-stock">Stock</label>
            <input id="p-stock" type="number" required min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="p-cat">Category</label>
            <select id="p-cat" className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-brand">Brand</label>
            <select id="p-brand" className="input" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">None</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-status">Status</label>
            <select id="p-status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label" htmlFor="p-image">Image URL</label>
            <input id="p-image" className="input" placeholder="/assets/products/example.jpg or https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          {msg && <p style={{ gridColumn: '1 / -1', color: 'var(--color-danger)', fontSize: 13 }}>{msg}</p>}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary">{form.id ? 'Save changes' : 'Create product'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {products.map((p) => (
          <div key={p.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={p.product_images?.[0]?.url || '/assets/placeholder-product.svg'} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>{p.categories?.name || 'Uncategorized'} · Stock: {p.stock} · Rs. {Number(p.price).toLocaleString()}</p>
            </div>
            <span className="badge" style={{ background: p.status === 'published' ? '#DCEFE4' : '#F0F0EC', color: p.status === 'published' ? 'var(--color-primary)' : 'var(--color-ink-soft)' }}>{p.status}</span>
            <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>Edit</button>
            <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(p)}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
            <button className="btn btn-outline btn-sm" onClick={() => remove(p.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
