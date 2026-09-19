// src/pages/ProductListing.tsx
import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@apollo/client';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import FilterSidebar from '../components/FilterSidebar';
import type { FilterState } from '../components/FilterSidebar';
import { GET_PRODUCTS, GET_CATEGORY_ID_BY_SLUG } from '../lib/graphql';
import { normalizeProductsCollection } from '../lib/normalizers';
import type { Product } from '../lib/normalizers';

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

  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // ✅ STEP 1: Fetch category ID from slug
  const { data: categoryData, loading: categoryLoading } = useQuery(
    GET_CATEGORY_ID_BY_SLUG,
    {
      variables: { slug: category },
      skip: category === 'all',
    }
  );

  const categoryId =
    categoryData?.categoriesCollection?.edges?.[0]?.node?.id ?? null;

  // ✅ STEP 2: Fetch products with category_id filter
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      filter:
        categoryId !== null
          ? { category_id: { eq: categoryId } }
          : undefined,
      first: 50,
    },
    skip: category !== 'all' && !categoryId,
  });

  // ✅ Normalize right after query
  const products: Product[] = useMemo(
    () => normalizeProductsCollection(data?.productsCollection),
    [data]
  );

  // Dynamic brands
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brands?.name) brandSet.add(p.brands.name);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // Filters
  const filteredProducts = products.filter((product) => {
    if (filters.brands.length > 0) {
      if (!product.brands?.name || !filters.brands.includes(product.brands.name)) {
        return false;
      }
    }

    if (filters.priceRange !== 'any') {
      const price = product.price;
      if (filters.priceRange === 'under-20k' && price >= 20000) return false;
      if (filters.priceRange === '20k-50k' && (price < 20000 || price > 50000)) return false;
      if (filters.priceRange === 'above-50k' && price <= 50000) return false;
    }

    if (filters.rating && product.rating < filters.rating) return false;
    if (filters.inStockOnly && product.stock <= 0) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'newest': return 0;
      default: return 0;
    }
  });

  const displayCategory =
    category === 'all'
      ? 'All Products'
      : category
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

  const isQueryLoading = loading || categoryLoading;

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-medium">{displayCategory}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">

          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            availableBrands={availableBrands.length > 0 ? availableBrands : undefined}
          />

          <div className="flex-1 min-w-0">

            {/* TOP BAR */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {displayCategory}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {isQueryLoading
                      ? 'Loading products...'
                      : `${sortedProducts.length} ${sortedProducts.length === 1 ? 'product' : 'products'} found`}
                  </p>
                </div>

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

            {/* PRODUCTS */}
            {isQueryLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <p className="text-red-700 font-semibold mb-2">Failed to load products</p>
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters</p>
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