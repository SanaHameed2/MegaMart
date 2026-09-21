// src/pages/BrandDetail.tsx
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { normalizeProductsCollection } from '../lib/normalizers';
import type { Product } from '../lib/normalizers';

// Query: brand + its products
const GET_BRAND_PRODUCTS = gql`
  query GetBrandProducts($brandSlug: String!, $first: Int = 50) {
    brandsCollection(filter: { slug: { eq: $brandSlug } }, first: 1) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
    productsCollection(
      filter: { brands: { slug: { eq: $brandSlug } } }
      first: $first
    ) {
      edges {
        node {
          id
          nodeId
          name
          slug
          price
          compare_at_price
          stock
          rating
          review_count
          brands {
            id
            name
            slug
          }
          product_imagesCollection(
            orderBy: [{ sort_order: AscNullsLast }]
            first: 5
          ) {
            edges {
              node {
                id
                url
                sort_order
              }
            }
          }
        }
      }
    }
  }
`;

export default function BrandDetail() {
  const { slug } = useParams();

  const { data, loading, error, refetch } = useQuery(GET_BRAND_PRODUCTS, {
    variables: { brandSlug: slug, first: 50 },
    skip: !slug,
    notifyOnNetworkStatusChange: true,
  });

  const brandName = useMemo(() => {
    return (
      data?.brandsCollection?.edges?.[0]?.node?.name ??
      (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Brand')
    );
  }, [data, slug]);

  const products: Product[] = useMemo(
    () => normalizeProductsCollection(data?.productsCollection),
    [data]
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link
            to="/brands"
            className="hover:text-[#008ECC] transition-colors"
          >
            Brands
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-medium">{brandName}</span>
        </nav>

        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {brandName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading products...'
              : error
              ? ''
              : `${products.length} ${products.length === 1 ? 'product' : 'products'} found`}
          </p>
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-gray-600 mb-4">Couldn&apos;t load products.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
            <p className="text-gray-500">
              No products found for {brandName}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}