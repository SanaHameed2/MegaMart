import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EssentialItem {
  id: number;
  title: string;
  discountText: string;
  image: string;
  slug: string;
}

const essentialItems: EssentialItem[] = [
  {
    id: 1,
    title: 'Daily Essentials',
    discountText: 'UP to 50% OFF',
    image: '/assets/images/daily-essentials.png',
    slug: 'daily-essentials',
  },
  {
    id: 2,
    title: 'Vegitables',
    discountText: 'UP to 50% OFF',
    image: '/assets/images/vagitables.png',
    slug: 'vegetables',
  },
  {
    id: 3,
    title: 'Fruits',
    discountText: 'UP to 50% OFF',
    image: '/assets/images/fruits.png',
    slug: 'fruits',
  },
  {
    id: 4,
    title: 'Strowberry',
    discountText: 'UP to 50% OFF',
    image: '/assets/images/strawberry.png',
    slug: 'strawberry',
  },
  {
    id: 5,
    title: 'Mango',
    discountText: 'UP to 50% OFF',
    image: '/assets/images/mango.jpg',
    slug: 'mango',
  },
  {
    id: 6,
    title: 'Cherry',
    discountText: 'UP to 50% OFF',
    image: '/assets/images/cherry.jpg',
    slug: 'cherry',
  },
];

export const DailyEssentialsSection: React.FC = () => {
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
          to="/essentials"
          className="flex items-center gap-1 text-[14px] font-medium text-[#666666] hover:text-[#008ECC] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4 text-[#008ECC]" />
        </Link>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {essentialItems.map((item, index) => (
          <Link
            key={item.id}
            to={`/category/${item.slug}`}
            className="flex flex-col items-center group text-center"
          >
            {/* Image Box */}
            <div
              className={`w-full aspect-square bg-[#F5F5F5] rounded-2xl flex items-center justify-center p-3 transition-all duration-300 group-hover:shadow-md ${
                index === 0 ? 'border-2 border-[#008ECC] shadow-sm' : 'border border-transparent'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content Stack */}
            <div className="mt-3 flex flex-col items-center">
              <span className="text-[13px] font-medium text-[#888888]">
                {item.title}
              </span>
              <span className="text-[14px] font-bold text-[#222222] mt-0.5">
                {item.discountText}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DailyEssentialsSection;