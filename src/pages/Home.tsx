import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, ErrorState } from '../components/States';
import HeroSlider from '../components/HeroSlider';
import SmartphoneSection from '../components/SmartphoneSection';
import TopCategoriesSection from '../components/TopCategoriesSection'; // 1. Imported TopCategoriesSection

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
      {/* Dynamic Hero Slider */}
      <HeroSlider />

      {/* Smartphone Deals Section */}
      <SmartphoneSection />

      {/* 2. Added Top Categories Section directly below Smartphone Deals */}
      <TopCategoriesSection />

      {/* Shop by Category Section */}
      <section className="container" style={{ padding: '20px 20px 40px' }}>
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

      {/* Today's Deals Section */}
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

      {/* Trending Products Section */}
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