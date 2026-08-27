import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, ErrorState } from '../components/States';

export default function Home() {
  const [deals, setDeals] = useState<Product[] | null>(null);
  const [trending, setTrending] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [dealsRes, trendingRes, cats] = await Promise.all([
        fetchProducts({ sort: 'discount', pageSize: 4 }),
        fetchProducts({ sort: 'rating', pageSize: 8 }),
        fetchCategories(),
      ]);
      setDeals(dealsRes.products);
      setTrending(trendingRes.products);
      setCategories(cats.filter((c) => !c.parent_id));
    } catch {
      setError('Could not load the homepage right now.');
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <section
        aria-label="Promotion"
        style={{
          background: 'linear-gradient(120deg, var(--color-primary), #123526)',
          color: '#fff', padding: '56px 20px',
        }}
      >
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: '1 1 320px' }}>
            <span className="badge badge-sale" style={{ marginBottom: 12, display: 'inline-block' }}>Season sale</span>
            <h1 style={{ fontSize: 40, color: '#fff', marginBottom: 12 }}>Everyday essentials,<br />priced fair.</h1>
            <p style={{ opacity: 0.85, marginBottom: 20, maxWidth: 420 }}>
              From groceries to gadgets — shop MegaMart's curated marketplace with fast delivery.
            </p>
            <Link to="/category/electronics" className="btn btn-accent">Shop electronics</Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>Shop by category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
          {categories.map((c) => (
            <Link key={c.id} to={`/category/${c.slug}`} className="card" style={{ padding: 20, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={load} />}

      <section className="container" style={{ padding: '20px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 style={{ fontSize: 22 }}>Today's deals</h2>
        </div>
        {deals === null ? <ProductGridSkeleton count={4} /> : deals.length === 0 ? (
          <p style={{ color: 'var(--color-ink-soft)' }}>No active deals right now — check back soon.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {deals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="container" style={{ padding: '20px 20px 60px' }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>Trending products</h2>
        {trending === null ? <ProductGridSkeleton /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
