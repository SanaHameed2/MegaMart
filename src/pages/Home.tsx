import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../lib/api';
import type { Category } from '../types';
import { ErrorState } from '../components/States';
import HeroSlider from '../components/HeroSlider';
import SmartphoneSection from '../components/SmartphoneSection';
import TopCategoriesSection from '../components/TopCategoriesSection';
import TopBrandsSection from '../components/TopBrandsSection';
import DailyEssentialsSection from '../components/DailyEssentialsSection';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const cats = await fetchCategories();
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

      {/* Top Categories Section */}
      <TopCategoriesSection />

      {/* Top Electronics Brands Section */}
      <TopBrandsSection />

      {/* Daily Essentials Section */}
      <DailyEssentialsSection />

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
    </div>
  );
}