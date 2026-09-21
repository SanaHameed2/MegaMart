// src/pages/Brands.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_BRANDS } from '../lib/graphql';

const BRAND_LOGOS: Record<string, string> = {
  'apple': '/assets/images/iphone-logo.png',
  'xiaomi': '/assets/images/mi-xiaomi-logo.png',
  'realme': '/assets/images/realme-logo.png',
};

const FALLBACK_LOGO = '/assets/images/electronics.png';

export default function Brands() {
  const { data, loading, error, refetch } = useQuery(GET_BRANDS, {
    notifyOnNetworkStatusChange: true,
  });

  const brands = useMemo(() => {
    const edges = data?.brandsCollection?.edges ?? [];
    return edges
      .map((e: any) => e?.node)
      .filter(Boolean)
      .filter((b: any) => b?.slug);
  }, [data]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-medium">All Brands</span>
        </nav>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Shop by Brand
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading brands...'
              : error
              ? ''
              : `${brands.length} ${brands.length === 1 ? 'brand' : 'brands'}`}
          </p>
        </div>

        {/* GRID */}
        {loading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
            role="status"
            aria-label="Loading brands"
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-2xl min-h-[140px]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-gray-600 mb-4">Couldn&apos;t load brands.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : brands.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-gray-500">No brands available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {brands.map((brand: any) => {
              const logo = BRAND_LOGOS[brand.slug] || FALLBACK_LOGO;
              return (
                <Link
                  key={brand.id}
                  to={`/brand/${encodeURIComponent(brand.slug)}`}
                  title={brand.name}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008ECC] focus-visible:ring-offset-2 transition-all min-h-[140px]"
                >
                  <div className="h-12 flex items-center justify-center">
                    <img
                      src={logo}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="max-h-full max-w-[100px] object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-[#008ECC] transition-colors text-center">
                    {brand.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}