// src/components/DailyEssentialsSection.tsx
import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../lib/graphql';
import { CATEGORY_IMAGES, FALLBACK_IMAGE } from '../lib/categoryImages';  // ✅ SHARED

// Skeleton
const CategorySkeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
    <div className="mt-3 h-3 bg-gray-200 rounded w-20" />
    <div className="mt-1 h-4 bg-gray-200 rounded w-24" />
  </div>
);

export const DailyEssentialsSection: React.FC = () => {
  // ============================================================
  // Fetch ALL categories (filter client-side to premium-fruits children)
  // ============================================================
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES, {
    notifyOnNetworkStatusChange: true,
  });

  const categories = useMemo(() => {
    const edges = data?.categoriesCollection?.edges ?? [];
    const allCategories = edges.map((e: any) => e.node);

    // Find the premium-fruits parent
    const premiumFruits = allCategories.find(
      (c: any) => c.slug === 'premium-fruits'
    );
    if (!premiumFruits) return [];

    // Return only its children
    return allCategories
      .filter((c: any) => c.parent_id === premiumFruits.id)
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [data]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      {/* Section Header */}
      <div className="relative flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
        <div className="relative">
          <h2 className="text-[20px] sm:text-[24px] leading-[30px] font-bold text-[#666666]">
            Daily <span className="text-[#008ECC]">Essentials</span>
          </h2>
          <div className="absolute -bottom-[13px] left-0 right-0 h-[3px] bg-[#008ECC] rounded-full" />
        </div>

        <Link
          to="/category/premium-fruits"
          className="flex items-center gap-1 text-[14px] font-medium text-[#666666] hover:text-[#008ECC] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4 text-[#008ECC]" />
        </Link>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {loading ? (
          // Skeletons
          [...Array(4)].map((_, i) => <CategorySkeleton key={i} />)
        ) : error ? (
          // Error state with Retry
          <div className="col-span-full text-center py-8 text-sm text-gray-500">
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
          <div className="col-span-full text-center py-8 text-gray-500 text-sm">
            No categories available.
          </div>
        ) : (
          // Real subcategories
          categories.map((category: any) => {
            const image = CATEGORY_IMAGES[category.slug] || FALLBACK_IMAGE;
            const safeSlug = encodeURIComponent(category.slug);

            return (
              <Link
                key={category.id}
                to={`/category/${safeSlug}`}
                title={category.name}
                className="flex flex-col items-center group text-center cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008ECC] focus-visible:ring-offset-2"
              >
                {/* Image Card Container — ✅ BUG-02 fix: no index===0 highlight */}
                <div className="w-full aspect-square bg-[#F5F5F5] rounded-2xl flex items-center justify-center p-4 transition-all duration-300 group-hover:shadow-md border border-transparent group-hover:border-[#008ECC]/30">
                  {/* ✅ BUG-13 fix: alt="" (decorative) — name below announces */}
                  <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>

                {/* Sub-text Stack */}
                <div className="mt-3 flex flex-col items-center">
                  <span className="text-[13px] font-medium text-[#888888]">
                    {category.name}
                  </span>
                  <span className="text-[14px] font-bold text-[#222222] mt-0.5">
                    UP to 50% OFF
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};

export default DailyEssentialsSection;
