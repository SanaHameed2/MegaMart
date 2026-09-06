import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryItem {
  id: number;
  name: string;
  image: string;
  slug: string;
  isActive?: boolean;
}

const categories: CategoryItem[] = [
  {
    id: 1,
    name: 'Mobile',
    image: '/assets/images/Mobile.png',
    slug: 'mobile',
    isActive: true,
  },
  {
    id: 2,
    name: 'Cosmetics',
    image: '/assets/images/cosmetics.png',
    slug: 'cosmetics',
  },
  {
    id: 3,
    name: 'Electronics',
    image: '/assets/images/electronics.png',
    slug: 'electronics',
  },
  {
    id: 4,
    name: 'Furniture',
    image: '/assets/images/furniture.png',
    slug: 'furniture',
  },
  {
    id: 5,
    name: 'Watches',
    image: '/assets/images/watches.png',
    slug: 'watches',
  },
  {
    id: 6,
    name: 'Decor',
    image: '/assets/images/Decor.png',
    slug: 'decor',
  },
  {
    id: 7,
    name: 'Accessories',
    image: '/assets/images/Accessories.png',
    slug: 'accessories',
  },
];

export const TopCategoriesSection: React.FC = () => {
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
      <div className="flex items-center justify-between overflow-x-auto gap-4 py-2 scrollbar-none">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="flex flex-col items-center group min-w-[100px] flex-shrink-0"
          >
            {/* Circle Container */}
            <div
              className={`w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full bg-[#F5F5F5] flex items-center justify-center p-4 transition-all duration-300 group-hover:shadow-md ${
                cat.isActive
                  ? 'border-2 border-[#008ECC] shadow-sm'
                  : 'border border-transparent hover:border-[#008ECC]'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Title */}
            <span className="mt-3 text-[15px] font-medium text-[#333333] group-hover:text-[#008ECC] transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopCategoriesSection;