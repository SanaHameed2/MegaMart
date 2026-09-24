// src/pages/admin/Categories.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../../lib/graphql';
import { CATEGORY_IMAGES, FALLBACK_IMAGE } from '../../lib/categoryImages';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number | null;
}

export default function AdminCategories() {
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES, {
    notifyOnNetworkStatusChange: true,
  });

  const { parents, childrenByParent } = useMemo(() => {
    const edges = data?.categoriesCollection?.edges ?? [];
    const all: Category[] = edges
      .map((e: any) => e?.node)
      .filter(Boolean)
      .filter((c: any) => c?.slug);

    const parents = all
      .filter((c) => !c.parent_id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const childrenByParent: Record<string, Category[]> = {};
    all
      .filter((c) => c.parent_id)
      .forEach((c) => {
        const key = c.parent_id!;
        if (!childrenByParent[key]) childrenByParent[key] = [];
        childrenByParent[key].push(c);
      });
    Object.values(childrenByParent).forEach((list) =>
      list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    );

    return { parents, childrenByParent };
  }, [data]);

  const totalCount = parents.length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-medium">All Categories</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Shop by Category
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading categories...'
              : error
              ? ''
              : `${totalCount} ${totalCount === 1 ? 'category' : 'categories'}`}
          </p>
        </div>

        {loading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
            role="status"
            aria-label="Loading categories"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-gray-600 mb-4">Couldn't load categories.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : parents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-500">No categories available.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {parents.map((parent) => {
              const children = childrenByParent[parent.id] ?? [];
              const parentImage = CATEGORY_IMAGES[parent.slug] || FALLBACK_IMAGE;

              return (
                <section key={parent.id}>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      {parent.name}
                    </h2>
                    <Link
                      to={`/category/${encodeURIComponent(parent.slug)}`}
                      className="text-sm text-[#008ECC] hover:text-[#0077B6] font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      View All
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  {children.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                      {children.map((child) => {
                        const image = CATEGORY_IMAGES[child.slug] || FALLBACK_IMAGE;
                        return (
                          <CategoryCard key={child.id} category={child} image={image} />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                      <CategoryCard category={parent} image={parentImage} />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category, image }: { category: Category; image: string }) {
  return (
    <Link
      to={`/category/${encodeURIComponent(category.slug)}`}
      title={category.name}
      className="group flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008ECC] focus-visible:ring-offset-2 transition-all"
    >
      <div className="w-full aspect-square bg-[#F5F5F5] rounded-xl flex items-center justify-center p-4 mb-3">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-800 group-hover:text-[#008ECC] transition-colors line-clamp-2">
        {category.name}
      </span>
    </Link>
  );
}