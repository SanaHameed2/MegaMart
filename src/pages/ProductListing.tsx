// src/pages/ProductListing.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import FilterSidebar from '../components/FilterSidebar';
import type { FilterState } from '../components/FilterSidebar';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'rating';

const DEFAULT_FILTERS: FilterState = {
  brands: [],
  priceRange: 'any',
  rating: null,
  inStockOnly: false,
};

export default function ProductListing() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || slug || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // ========== FETCH PRODUCTS ==========
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await fetchProducts({
          categorySlug: category !== 'all' ? category : undefined,
          pageSize: 50,
        });

        // Handle api.ts return format { products, total }
        const productList = (result as any)?.products || result || [];
        setProducts(Array.isArray(productList) ? productList : []);
      } catch (err) {
        console.error('Failed to load products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  // ========== DYNAMIC BRANDS (from actual products) ==========
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p: any) => {
      const brandName = p.brands?.name;
      if (brandName) brandSet.add(brandName);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // ========== APPLY FILTERS ==========
  const filteredProducts = products.filter((product: any) => {
    // ✅ BRAND FILTER - Use brands relation, not name
    if (filters.brands.length > 0) {
      const productBrand = product.brands?.name || '';
      if (!filters.brands.includes(productBrand)) return false;
    }

    // ✅ PRICE FILTER
    if (filters.priceRange !== 'any') {
      if (filters.priceRange === 'under-20k' && product.price >= 20000) return false;
      if (filters.priceRange === '20k-50k' && (product.price < 20000 || product.price > 50000)) return false;
      if (filters.priceRange === 'above-50k' && product.price <= 50000) return false;
    }

    // ✅ RATING FILTER
    if (filters.rating && (!product.rating || product.rating < filters.rating)) return false;

    // ✅ STOCK FILTER
    if (filters.inStockOnly && product.stock <= 0) return false;

    return true;
  });

  // ========== APPLY SORTING ==========
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'newest': return (b.created_at || 0) - (a.created_at || 0);
      default: return 0;
    }
  });

  const displayCategory = category === 'all'
    ? 'All Products'
    : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ========== BREADCRUMB ========== */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-medium">{displayCategory}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ========== SIDEBAR ========== */}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            availableBrands={availableBrands.length > 0 ? availableBrands : undefined}
          />

          {/* ========== MAIN CONTENT ========== */}
          <div className="flex-1 min-w-0">

            {/* ========== TOP BAR ========== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {displayCategory}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {loading
                      ? 'Loading products...'
                      : `${sortedProducts.length} ${sortedProducts.length === 1 ? 'product' : 'products'} found`}
                  </p>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-500 font-medium whitespace-nowrap">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#008ECC] focus:ring-2 focus:ring-[#008ECC]/10 min-w-[180px] cursor-pointer transition-all"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ========== PRODUCT GRID ========== */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Try adjusting your filters or search
                </p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="bg-[#008ECC] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#0077B6] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}