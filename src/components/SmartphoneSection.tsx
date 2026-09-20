// src/components/SmartphoneSection.tsx
import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS, GET_CATEGORY_ID_BY_SLUG } from '../lib/graphql';
import { normalizeProductsCollection } from '../lib/normalizers';
import type { Product } from '../lib/normalizers';

// Skeleton loader
const ProductSkeleton = () => (
  <div className="relative bg-[#F5F5F5] rounded-2xl p-4 overflow-hidden animate-pulse">
    <div className="h-48 w-full bg-gray-200 rounded-xl my-4" />
    <div className="border-t border-gray-200/60 pt-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-5 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

export const SmartphoneSection: React.FC = () => {
  // ========== STEP 1: Get smartphones category ID ==========
  const { data: categoryData, loading: categoryLoading } = useQuery(
    GET_CATEGORY_ID_BY_SLUG,
    { variables: { slug: 'smartphones' } }
  );

  const categoryId =
    categoryData?.categoriesCollection?.edges?.[0]?.node?.id ?? null;

  // ========== STEP 2: Fetch products with category_id filter ==========
  const { data, loading: productsLoading } = useQuery(GET_PRODUCTS, {
    variables: {
      filter: categoryId ? { category_id: { eq: categoryId } } : undefined,
      first: 4,
    },
    skip: !categoryId,
  });

  // ========== Normalize ==========
  const products: Product[] = useMemo(
    () => normalizeProductsCollection(data?.productsCollection).slice(0, 4),
    [data]
  );

  const loading = categoryLoading || productsLoading;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-['HK_Grotesk',sans-serif]">
      {/* Section Header */}
      <div className="relative flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
        <div className="relative">
          <h2 className="text-[20px] sm:text-[24px] leading-[30px] font-bold text-[#666666]">
            Grab the best deal on{' '}
            <span className="text-[#008ECC]">Smartphones</span>
          </h2>
          <div className="absolute -bottom-[13px] left-0 right-0 h-[3px] bg-[#008ECC] rounded-full" />
        </div>

        <Link
          to="/category/smartphones"
          className="flex items-center gap-1 text-[14px] font-medium text-[#666666] hover:text-[#008ECC] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4 text-[#008ECC]" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          // Skeletons
          [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
        ) : products.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-8 text-gray-500 text-sm">
            No smartphones available at the moment.
          </div>
        ) : (
          // Real products
          products.map((product) => {
            const savings = product.compareAtPrice
              ? product.compareAtPrice - product.price
              : 0;
            const discountPercent = product.compareAtPrice
              ? Math.round(
                  ((product.compareAtPrice - product.price) /
                    product.compareAtPrice) *
                    100
                )
              : 0;

            return (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="relative bg-[#F5F5F5] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-[#008ECC] group overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-0 right-0 bg-[#008ECC] text-white text-xs font-semibold rounded-bl-2xl rounded-tr-2xl px-3 py-2 text-center leading-tight z-10">
                    <div>{discountPercent}%</div>
                    <div>OFF</div>
                  </div>
                )}

                {/* Product Image */}
                <div className="h-48 w-full flex items-center justify-center my-4">
                  <img
                    src={product.primaryImage}
                    alt={product.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/placeholder-product.svg';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="mt-2 border-t border-gray-200/60 pt-3">
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-1 mb-2">
                    {product.name}
                  </h3>

                  {/* Pricing */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-black">
                      Rs. {product.price.toLocaleString('en-PK')}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        Rs. {product.compareAtPrice.toLocaleString('en-PK')}
                      </span>
                    )}
                  </div>

                  {/* Savings */}
                  {savings > 0 && (
                    <p className="text-sm font-semibold text-[#249B3E]">
                      Save - Rs. {savings.toLocaleString('en-PK')}
                    </p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};

export default SmartphoneSection;