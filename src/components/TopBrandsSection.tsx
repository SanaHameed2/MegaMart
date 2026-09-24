// src/components/TopBrandsSection.tsx
import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_BRANDS } from '../lib/graphql';

interface BrandStyle {
  bgColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  logo?: string;
  productImage?: string;
  bgCircleImage?: string;
  isDark: boolean;
}

const BRAND_STYLES: Record<string, BrandStyle> = {
  'apple': {
    bgColor: 'bg-[#313131]',
    badgeBgColor: 'bg-[#494949]',
    badgeTextColor: 'text-white',
    logo: '/assets/images/iphone-logo.png',
    productImage: '/assets/images/iphone-phone.png',
    bgCircleImage: '/assets/images/circle-behind-iphone.png',
    isDark: true,
  },
  'xiaomi': {
    bgColor: 'bg-[#FFECE2]',
    badgeBgColor: 'bg-[#FFCBB3]',
    badgeTextColor: 'text-[#222222]',
    logo: '/assets/images/mi-xiaomi-logo.png',
    productImage: '/assets/images/xiaomi-phone.png',
    bgCircleImage: '/assets/images/circle-behind-xiaomi.png',
    isDark: false,
  },
  'samsung': {
    bgColor: 'bg-[#E8F0FE]',
    badgeBgColor: 'bg-[#C5DBFF]',
    badgeTextColor: 'text-[#222222]',
    logo: '/assets/images/realme-logo.png',
    productImage: '/assets/images/Galaxy S22 Ultra.png',
    bgCircleImage: '/assets/images/circle-behind-realme.png',
    isDark: false,
  },
};

const FALLBACK_STYLE: BrandStyle = {
  bgColor: 'bg-[#F5F5F5]',
  badgeBgColor: 'bg-[#E5E5E5]',
  badgeTextColor: 'text-[#222222]',
  isDark: false,
};

const FALLBACK_BG_PALETTE = [
  'bg-[#FFF3C7]',
  'bg-[#FFECE2]',
  'bg-[#E8F0FE]',
  'bg-[#E8F5E9]',
  'bg-[#FCE4EC]',
];

const BrandCardSkeleton = () => (
  <div className="relative bg-gray-100 rounded-2xl h-[190px] p-5 animate-pulse">
    <div className="flex flex-col justify-between h-full max-w-[60%]">
      <div className="h-8 w-24 bg-gray-200 rounded-lg" />
      <div className="space-y-2">
        <div className="h-10 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const TopBrandsSection: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_BRANDS, {
    notifyOnNetworkStatusChange: true,
  });

  const brands = useMemo(() => {
    const edges = data?.brandsCollection?.edges ?? [];
    return edges
      .map((e: any) => e?.node)
      .filter(Boolean)
      .filter((b: any) => b?.slug)
      .slice(0, 6);
  }, [data]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      <div className="relative flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
        <div className="relative">
          <h2 className="text-[20px] sm:text-[24px] leading-[30px] font-bold text-[#666666]">
            Top <span className="text-[#008ECC]">Brands</span>
          </h2>
          <div className="absolute -bottom-[13px] left-0 right-0 h-[3px] bg-[#008ECC] rounded-full" />
        </div>

        <Link
          to="/brands"
          className="flex items-center gap-1 text-[14px] font-medium text-[#666666] hover:text-[#008ECC] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4 text-[#008ECC]" />
        </Link>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6"
        aria-busy={loading}
      >
        {loading ? (
          [...Array(3)].map((_, i) => <BrandCardSkeleton key={i} />)
        ) : error ? (
          <div className="col-span-full text-center py-8 text-sm text-gray-500">
            Couldn't load brands.{' '}
            <button
              type="button"
              onClick={() => refetch()}
              className="text-[#008ECC] underline hover:text-[#0077B6]"
            >
              Retry
            </button>
          </div>
        ) : brands.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 text-sm">
            No brands available.
          </div>
        ) : (
          brands.map((brand: any, index: number) => {
            const mappedStyle = BRAND_STYLES[brand.slug];
            const fallbackBg =
              FALLBACK_BG_PALETTE[index % FALLBACK_BG_PALETTE.length];
            const style: BrandStyle = mappedStyle || {
              ...FALLBACK_STYLE,
              bgColor: fallbackBg,
            };

            const safeSlug = encodeURIComponent(brand.slug);

            return (
              <Link
                key={brand.id}
                to={`/brand/${safeSlug}`}
                className={`relative ${style.bgColor} rounded-2xl h-[190px] p-5 flex items-center justify-between overflow-hidden group transition-transform duration-300 hover:scale-[1.02] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008ECC] focus-visible:ring-offset-2`}
              >
                {style.bgCircleImage && (
                  <img
                    src={style.bgCircleImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute right-0 top-0 h-full w-auto object-cover opacity-60 pointer-events-none"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}

                <div className="flex flex-col justify-between h-full z-10 max-w-[60%]">
                  <div>
                    <span
                      className={`inline-block text-[13px] font-normal tracking-[0.1em] px-4 py-1.5 rounded-lg uppercase ${style.badgeBgColor} ${style.badgeTextColor}`}
                    >
                      {brand.name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {style.logo ? (
                      <div className="h-[40px] flex items-center justify-start">
                        <img
                          src={style.logo}
                          alt=""
                          aria-hidden="true"
                          className="max-h-full max-w-[110px] object-contain"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null}
                    <p
                      className={`text-[18px] sm:text-[20px] font-bold leading-tight ${
                        style.isDark ? 'text-white' : 'text-[#222222]'
                      }`}
                    >
                      Shop Now
                    </p>
                  </div>
                </div>

                {style.productImage && (
                  <div className="h-full w-[40%] flex items-center justify-end z-10">
                    <img
                      src={style.productImage}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-[175px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};

export default TopBrandsSection;