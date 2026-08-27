import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchBrands } from '../lib/api';
import type { ProductFilters } from '../lib/api';
import type { Product, Brand } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, EmptyState, ErrorState } from '../components/States';

const PAGE_SIZE = 12;

export default function ProductListing() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || undefined;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<'any' | 'under20' | '20-50' | 'over50'>('any');
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<ProductFilters['sort']>('featured');

  useEffect(() => { fetchBrands().then(setBrands).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setError(null);
    let minPrice: number | undefined, maxPrice: number | undefined;
    if (priceRange === 'under20') maxPrice = 20000;
    if (priceRange === '20-50') { minPrice = 20000; maxPrice = 50000; }
    if (priceRange === 'over50') minPrice = 50000;

    try {
      const res = await fetchProducts({
        categorySlug: slug,
        search: searchQuery,
        brandSlugs: selectedBrands,
        minPrice, maxPrice,
        minRating: minRating || undefined,
        inStockOnly,
        sort,
        page,
        pageSize: PAGE_SIZE,
      });
      setProducts(res.products);
      setTotal(res.total);
    } catch {
      setError('Could not load products.');
      setProducts([]);
    }
  }, [slug, searchQuery, selectedBrands, priceRange, minRating, inStockOnly, sort, page]);

  useEffect(() => { setPage(1); }, [slug, searchQuery, selectedBrands, priceRange, minRating, inStockOnly, sort]);
  useEffect(() => { setProducts(null); load(); }, [load]);

  function toggleBrand(brandSlug: string) {
    setSelectedBrands((prev) => prev.includes(brandSlug) ? prev.filter((b) => b !== brandSlug) : [...prev, brandSlug]);
  }

  const heading = searchQuery ? `Results for "${searchQuery}"` : slug ? slug.replace(/-/g, ' ') : 'All products';
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container" style={{ padding: '32px 20px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
      <aside aria-label="Filters">
        <h2 style={{ fontSize: 16, marginBottom: 16, textTransform: 'capitalize' }}>Filters</h2>

        <fieldset style={{ border: 'none', padding: 0, marginBottom: 20 }}>
          <legend className="label">Brand</legend>
          {brands.map((b) => (
            <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 6 }}>
              <input type="checkbox" checked={selectedBrands.includes(b.slug)} onChange={() => toggleBrand(b.slug)} />
              {b.name}
            </label>
          ))}
        </fieldset>

        <fieldset style={{ border: 'none', padding: 0, marginBottom: 20 }}>
          <legend className="label">Price</legend>
          {[
            { key: 'any', label: 'Any price' },
            { key: 'under20', label: 'Under Rs. 20,000' },
            { key: '20-50', label: 'Rs. 20,000 – 50,000' },
            { key: 'over50', label: 'Rs. 50,000+' },
          ].map((opt) => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 6 }}>
              <input type="radio" name="price" checked={priceRange === opt.key} onChange={() => setPriceRange(opt.key as any)} />
              {opt.label}
            </label>
          ))}
        </fieldset>

        <fieldset style={{ border: 'none', padding: 0, marginBottom: 20 }}>
          <legend className="label">Rating</legend>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={minRating === 4} onChange={(e) => setMinRating(e.target.checked ? 4 : 0)} />
            4★ & above
          </label>
        </fieldset>

        <fieldset style={{ border: 'none', padding: 0 }}>
          <legend className="label">Availability</legend>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            In stock only
          </label>
        </fieldset>
      </aside>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, textTransform: 'capitalize' }}>{heading}</h1>
            <p style={{ color: 'var(--color-ink-soft)', fontSize: 13 }}>{total} products</p>
          </div>
          <div>
            <label htmlFor="sort" className="visually-hidden">Sort by</label>
            <select id="sort" className="input" value={sort} onChange={(e) => setSort(e.target.value as ProductFilters['sort'])} style={{ width: 200 }}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={load} />}
        {!error && products === null && <ProductGridSkeleton />}
        {!error && products !== null && products.length === 0 && (
          <EmptyState title="No products found" message="Try adjusting your filters or search terms." />
        )}
        {!error && products !== null && products.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <span style={{ alignSelf: 'center', fontSize: 13 }}>Page {page} of {totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
