import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BrandCard {
  id: number;
  brandName: string;
  badgeText: string;
  discountText: string;
  bgColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  logo: string;
  productImage: string;
  bgCircleImage: string;
  slug: string;
}

const brandCards: BrandCard[] = [
  {
    id: 1,
    brandName: 'IPHONE',
    badgeText: 'IPHONE',
    discountText: 'UP to 80% OFF',
    bgColor: 'bg-[#313131]',
    badgeBgColor: 'bg-[#494949]',
    badgeTextColor: 'text-white',
    logo: '/assets/images/iphone-logo.png',
    productImage: '/assets/images/Iphone-phone.png',
    bgCircleImage: '/assets/images/ircle=behind-iphone.png',
    slug: 'apple',
  },
  {
    id: 2,
    brandName: 'REALME',
    badgeText: 'REALME',
    discountText: 'UP to 80% OFF',
    bgColor: 'bg-[#FFF3C7]',
    badgeBgColor: 'bg-[#F6DE8D]',
    badgeTextColor: 'text-[#222222]',
    logo: '/assets/images/realme-logo.png',
    productImage: '/assets/images/realme-phone.png',
    bgCircleImage: '/assets/images/circle-behind-realme.png',
    slug: 'realme',
  },
  {
    id: 3,
    brandName: 'XIAOMI',
    badgeText: 'XIAOMI',
    discountText: 'UP to 80% OFF',
    bgColor: 'bg-[#FFECE2]',
    badgeBgColor: 'bg-[#FFCBB3]',
    badgeTextColor: 'text-[#222222]',
    logo: '/assets/images/mi-xiaomi-logo.png',
    productImage: '/assets/images/xiaomi-phone.png',
    bgCircleImage: '/assets/images/circle=behind-xiaomi.png',
    slug: 'xiaomi',
  },
];

export const TopBrandsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      {/* Section Header - Exact Figma Style with Blue Underline */}
      <div className="relative flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
        <div className="relative">
          <h2 className="text-[20px] sm:text-[24px] leading-[30px] font-bold text-[#666666]">
            Top <span className="text-[#008ECC]">Electronics Brands</span>
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

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {brandCards.map((card) => (
          <Link
            key={card.id}
            to={`/brand/${card.slug}`}
            className={`relative ${card.bgColor} rounded-2xl h-[190px] p-5 flex items-center justify-between overflow-hidden group transition-transform duration-300 hover:scale-[1.02] shadow-sm`}
          >
            {/* Background Vector Circle Overlay */}
            <img
              src={card.bgCircleImage}
              alt=""
              className="absolute right-0 top-0 h-full w-auto object-cover opacity-60 pointer-events-none"
            />

            {/* Left Column Content */}
            <div className="flex flex-col justify-between h-full z-10 max-w-[50%]">
              {/* Badge */}
              <div>
                <span className={`inline-block font-sans text-[13px] font-normal tracking-[0.1em] px-4 py-1.5 rounded-lg uppercase ${card.badgeBgColor} ${card.badgeTextColor}`}>
                  {card.badgeText}
                </span>
              </div>

              {/* Logo & Discount Text Stack */}
              <div className="flex flex-col gap-2">
                <div className="h-[40px] flex items-center justify-start">
                  <img
                    src={card.logo}
                    alt={card.brandName}
                    className="max-h-full max-w-[110px] object-contain"
                  />
                </div>
                <p className={`text-[18px] sm:text-[20px] font-bold leading-tight ${card.id === 1 ? 'text-white' : 'text-[#222222]'}`}>
                  {card.discountText}
                </p>
              </div>
            </div>

            {/* Right Product Image Container - Pixel Perfect Heights */}
            <div className="h-full w-[50%] flex items-center justify-end z-10">
              <img
                src={card.productImage}
                alt={card.brandName}
                className="h-[175px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2">
        <span className="w-6 h-2 bg-[#008ECC] rounded-full" />
        <span className="w-2 h-2 bg-gray-300 rounded-full" />
        <span className="w-2 h-2 bg-gray-300 rounded-full" />
        <span className="w-2 h-2 bg-gray-300 rounded-full" />
        <span className="w-2 h-2 bg-gray-300 rounded-full" />
      </div>
    </section>
  );
};

export default TopBrandsSection;