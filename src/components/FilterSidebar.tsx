// src/components/FilterSidebar.tsx
import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

// ========== EXPORTED INTERFACE ==========
export interface FilterState {
  brands: string[];
  priceRange: 'any' | 'under-20k' | '20k-50k' | 'above-50k';
  rating: number | null;
  inStockOnly: boolean;
}

// ========== DEFAULT FILTERS ==========
export const DEFAULT_FILTERS: FilterState = {
  brands: [],
  priceRange: 'any',
  rating: null,
  inStockOnly: false,
};

// ========== PROPS ==========
interface FilterSidebarProps {
  filters?: FilterState;
  onChange: (filters: FilterState) => void;
  availableBrands?: string[];
}

// ========== MAIN COMPONENT ==========
export default function FilterSidebar({
  filters,
  onChange,
  availableBrands = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Realme'],
}: FilterSidebarProps) {
  // ✅ Safe fallback - crash nahi hoga
  const safeFilters: FilterState = filters ?? DEFAULT_FILTERS;

  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    rating: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleBrand = (brand: string) => {
    const newBrands = safeFilters.brands.includes(brand)
      ? safeFilters.brands.filter((b) => b !== brand)
      : [...safeFilters.brands, brand];
    onChange({ ...safeFilters, brands: newBrands });
  };

  const hasActiveFilters =
    safeFilters.brands.length > 0 ||
    safeFilters.priceRange !== 'any' ||
    safeFilters.rating !== null ||
    safeFilters.inStockOnly;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-20">
        {/* ========== HEADER ========== */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#008ECC] rounded-full"></span>
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-xs text-[#008ECC] hover:text-[#0077B6] font-semibold flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* ========== BRAND ========== */}
        <FilterSection
          title="Brand"
          expanded={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
        >
          <div className="space-y-2.5">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={safeFilters.brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-[#008ECC] peer-checked:bg-[#008ECC] transition-all flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* ========== PRICE ========== */}
        <FilterSection
          title="Price"
          expanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-2.5">
            {[
              { value: 'any', label: 'Any price' },
              { value: 'under-20k', label: 'Under Rs. 20,000' },
              { value: '20k-50k', label: 'Rs. 20,000 - 50,000' },
              { value: 'above-50k', label: 'Rs. 50,000+' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    checked={safeFilters.priceRange === option.value}
                    onChange={() =>
                      onChange({
                        ...safeFilters,
                        priceRange: option.value as FilterState['priceRange'],
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-[#008ECC] transition-all flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#008ECC] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* ========== RATING ========== */}
        <FilterSection
          title="Rating"
          expanded={expandedSections.rating}
          onToggle={() => toggleSection('rating')}
        >
          <div className="space-y-2.5">
            {[4, 3, 2].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={safeFilters.rating === rating}
                    onChange={() =>
                      onChange({
                        ...safeFilters,
                        rating: safeFilters.rating === rating ? null : rating,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-[#008ECC] peer-checked:bg-[#008ECC] transition-all flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 flex items-center gap-1">
                  <span className="text-[#F4A300]">★</span>
                  {rating} & above
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* ========== AVAILABILITY ========== */}
        <FilterSection
          title="Availability"
          expanded={expandedSections.availability}
          onToggle={() => toggleSection('availability')}
        >
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={safeFilters.inStockOnly}
                onChange={() =>
                  onChange({
                    ...safeFilters,
                    inStockOnly: !safeFilters.inStockOnly,
                  })
                }
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-[#008ECC] peer-checked:bg-[#008ECC] transition-all flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              In stock only
            </span>
          </label>
        </FilterSection>
      </div>
    </aside>
  );
}

// ========== SECTION WRAPPER ==========
function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 pb-5 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#008ECC] transition-colors">
          {title}
        </h3>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            expanded ? '' : '-rotate-90'
          }`}
        />
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
}