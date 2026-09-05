import React from 'react';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Galaxy S22 Ultra',
    image: '/assets/images/s22.png',
    price: 32999,
    originalPrice: 74999,
    discountPercent: 56,
  },
  {
    id: 2,
    name: 'Galaxy M13 (4GB | 64 GB )',
    image: '/assets/images/m13.png',
    price: 10499,
    originalPrice: 14999,
    discountPercent: 56,
  },
  {
    id: 3,
    name: 'Galaxy M33 (4GB | 64 GB )',
    image: '/assets/images/m33.png',
    price: 16999,
    originalPrice: 24999,
    discountPercent: 56,
  },
  {
    id: 4,
    name: 'Galaxy M53 (4GB | 64 GB )',
    image: '/assets/images/m53.png',
    price: 31999,
    originalPrice: 40999,
    discountPercent: 56,
  },
];

export const SmartphoneSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-['HK_Grotesk',sans-serif]">
      {/* Section Heading: HK Grotesk Bold 24px / Line Height 30px */}
      <div className="border-b border-gray-200 pb-3 mb-6">
        <h2 className="text-[24px] leading-[30px] font-bold text-[#666666]">
          Grab the best deal on <span className="text-[#008ECC]">Smartphones</span>
        </h2>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const savings = product.originalPrice - product.price;

          return (
            <div
              key={product.id}
              className="relative bg-[#F5F5F5] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-[#008ECC] group overflow-hidden flex flex-col justify-between"
            >
              {/* Discount Badge */}
              <div className="absolute top-0 right-0 bg-[#008ECC] text-white text-xs font-semibold rounded-bl-2xl rounded-tr-2xl px-3 py-2 text-center leading-tight z-10">
                <div>{product.discountPercent}%</div>
                <div>OFF</div>
              </div>

              {/* Product Image */}
              <div className="h-48 w-full flex items-center justify-center my-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="mt-2 border-t border-gray-200/60 pt-3">
                <h3 className="text-base font-semibold text-gray-800 line-clamp-1 mb-2">
                  {product.name}
                </h3>

                {/* Pricing Block */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-black">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Savings Green Accent */}
                <p className="text-sm font-semibold text-[#249B3E]">
                  Save - ₹{savings.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SmartphoneSection;