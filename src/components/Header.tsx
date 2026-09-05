import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, MapPin, Truck, Tag, Menu } from 'lucide-react';
import { useCart } from '../store/cart';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cartStore = useCart();
  const cartItems = cartStore?.items || [];
  const cartCount = cartItems.reduce((acc, item) => acc + (item?.quantity || 1), 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    "Premium Fruits",
    "Home & Kitchen",
    "Fashion",
    "Electronics",
    "Beauty",
    "Home Improvement",
    "Sports, Toys & Luggage"
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 font-sans sticky top-0 z-50">
      {/* 1. Top Utility Bar (Figma Exact) */}
      <div className="bg-gray-50 text-[11px] text-gray-500 py-1.5 px-4 sm:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>Welcome to worldwide Megamart!</span>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#008ECC]" /> Deliver to <b className="text-gray-800">423651</b>
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#008ECC]" /> Track your order
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#008ECC]" /> All Offers
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button className="p-2 text-[#008ECC] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="text-2xl font-black text-[#008ECC] tracking-tight">
            MegaMart
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-[#008ECC]" />
            <input
              type="text"
              placeholder="Search essentials, groceries and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F9FB] border border-[#E0F2FE] rounded-xl py-2 pl-10 pr-4 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008ECC]/20 placeholder-gray-400"
            />
          </div>
        </form>

        {/* User & Cart Actions */}
        <div className="flex items-center gap-5 text-xs font-semibold text-gray-700">
          <Link to="/account" className="flex items-center gap-1.5 hover:text-[#008ECC]">
            <User className="w-4 h-4 text-[#008ECC]" />
            <span>Sign In/Up</span>
          </Link>
          <div className="h-4 w-px bg-gray-200"></div>
          <Link to="/cart" className="flex items-center gap-1.5 hover:text-[#008ECC] relative">
            <ShoppingBag className="w-4 h-4 text-[#008ECC]" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#008ECC] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 3. Category Horizontal Scroll Pills */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-3 overflow-x-auto py-2 text-xs no-scrollbar">
          <button className="bg-[#008ECC] text-white px-3.5 py-1.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
            Groceries <span className="text-[9px]">▼</span>
          </button>
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="bg-gray-50 hover:bg-[#F3F9FB] text-gray-600 hover:text-[#008ECC] px-3 py-1.5 rounded-full font-medium whitespace-nowrap border border-gray-100 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;