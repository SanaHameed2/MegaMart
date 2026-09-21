// src/components/TopCategoriesSection.tsx
import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_TOP_CATEGORIES } from '../lib/graphql';

// ============================================================
// Category image mapping (slug → public asset)
// - All filenames use the exact case as on disk (Linux-safe)
// - Unmapped slugs fall back to FALLBACK_IMAGE
// - TODO: migrate to categories.image_url column so new
//   categories don't require a code deploy
// ============================================================
const CATEGORY_IMAGES: Record<string, string> = {
  'electronics': '/assets/images/electronics.png',
  'fashion': '/assets/images/cosmetics.png', // temporary — no dedicated fashion image yet
  'home-kitchen': '/assets/images/furniture.png',
  'groceries': '/assets/images/fruits.png',
  'premium-fruits': '/assets/images/fruits.png',
};

const FALLBACK_IMAGE = '/assets/images/electronics.png';

export const TopCategoriesSection: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_TOP_CATEGORIES, {
    notifyOnNetworkStatusChange: true,
  });

  const categories = useMemo(() => {
    const edges = data?.categoriesCollection?.edges ?? [];
    return edges
      .map((e: any) => e?.node)
      .filter(Boolean)
      .filter(
        (c: any) =>
          c?.slug && (c.parent_id === null || c.parent_id === undefined)
      );
  }, [data]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-['HK_Grotesk',sans-serif]">
      {/* Section Header */}
      <div className="relative flex items-center justify-between border-b border-gray-200 pb-3 mb-8">
        <div className="relative">
          <h2 className="text-[20px] sm:text-[24px] leading-[30px] font-bold text-[#666666]">
            Shop From <span className="text-[#008ECC]">Top Categories</span>
          </h2>
          <div className="absolute -bottom-[13px] left-0 right-0 h-[3px] bg-[#008ECC] rounded-full" />
        </div>

        <Link
          to="/categories"
          className="flex items-center gap-1 text-[14px] font-medium text-[#666666] hover:text-[#008ECC] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4 text-[#008ECC]" />
        </Link>
      </div>

      {/* Circular Categories List */}
      <div
        className="flex items-center overflow-x-auto gap-4 py-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading ? (
          // Skeleton — single role="status" on parent
          <div
            className="flex items-center gap-4 w-full"
            role="status"
            aria-label="Loading categories"
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center min-w-[100px] animate-pulse flex-shrink-0"
              >
                <div className="w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full bg-gray-200" />
                <div className="mt-3 h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state with Retry
          <div className="w-full text-center py-8 text-sm text-gray-500">
            Couldn&apos;t load categories.{' '}
            <button
              type="button"
              onClick={() => refetch()}
              className="text-[#008ECC] underline hover:text-[#0077B6]"
            >
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          // Empty state
          <div className="w-full text-center py-8 text-gray-500 text-sm">
            No categories available.
          </div>
        ) : (
          // Real categories
          categories.map((cat: any) => {
            const image = CATEGORY_IMAGES[cat.slug] || FALLBACK_IMAGE;
            const safeSlug = encodeURIComponent(cat.slug);

            return (
              <Link
                key={cat.id}
                to={`/category/${safeSlug}`}
                title={cat.name}
                className="flex flex-col items-center group min-w-[100px] flex-shrink-0 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008ECC] focus-visible:ring-offset-2"
              >
                {/* Circle Container */}
                <div className="w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full bg-[#F5F5F5] flex items-center justify-center p-4 transition-all duration-300 group-hover:shadow-md border border-transparent group-hover:border-[#008ECC]">
                  <img
                    src={image}
                    alt={cat.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>

                {/* Title */}
                <span
                  className="mt-3 text-[15px] font-medium text-[#333333] group-hover:text-[#008ECC] transition-colors text-center max-w-[110px] truncate"
                  title={cat.name}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};

export default TopCategoriesSection;