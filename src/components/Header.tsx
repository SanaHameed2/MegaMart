// src/components/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User,
  MapPin,
  Truck,
  Tag,
  Menu,
  Heart,
  Package,
  MapPinned,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';

export default function Header() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const cartCount = useCart((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setAccountMenuOpen(false);
    await logout();
    navigate('/');
  }

  const categories: { name: string; slug: string }[] = [
    { name: 'Groceries', slug: 'groceries' },
    { name: 'Premium Fruits', slug: 'premium-fruits' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Beauty', slug: 'beauty' },
    { name: 'Home Improvement', slug: 'home-improvement' },
    { name: 'Sports, Toys & Luggage', slug: 'sports-toys-luggage' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-[#F3F9FB] border-b border-[#E0F2FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9 text-xs text-gray-600">
            <div className="flex items-center gap-6">
              <span>Welcome to worldwide MegaMart!</span>
              <span className="hidden sm:flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#008ECC]" />
                Deliver to <strong className="text-[#008ECC]">423651</strong>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/account/orders" className="flex items-center gap-1.5 hover:text-[#008ECC]">
                <Truck className="w-3.5 h-3.5" />
                Track your order
              </Link>
              <Link to="/brands" className="flex items-center gap-1.5 hover:text-[#008ECC]">
                <Tag className="w-3.5 h-3.5" />
                All Offers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-[#008ECC]" />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-black text-[#008ECC] tracking-tight shrink-0">
            MegaMart
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search essentials, groceries and more..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value.trim();
                    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
                  }
                }}
                className="w-full bg-[#F3F9FB] border border-[#E0F2FE] rounded-xl py-2 pl-10 pr-4 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008ECC]/20 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Account */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 hover:text-[#008ECC] transition-colors"
                  aria-label="Account menu"
                  aria-expanded={accountMenuOpen}
                >
                  <User className="w-4 h-4 text-[#008ECC]" />
                  <span className="hidden sm:inline text-xs font-medium truncate max-w-[100px]">
                    {profile?.full_name || user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {profile?.full_name || user.email}
                      </p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      My Orders
                    </Link>

                    <Link
                      to="/account/addresses"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <MapPinned className="w-4 h-4 text-gray-400" />
                      My Addresses
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="w-4 h-4 text-gray-400" />
                      My Wishlist
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#C0392B] hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 hover:text-[#008ECC] transition-colors">
                <User className="w-4 h-4 text-[#008ECC]" />
                <span className="text-xs font-medium">Sign In/Up</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="hidden sm:flex items-center gap-1.5 hover:text-[#008ECC] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 text-[#008ECC]" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 hover:text-[#008ECC] transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-4 h-4 text-[#008ECC]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F4A300] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden lg:flex items-center gap-2 py-2 border-t border-gray-100 overflow-x-auto">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#008ECC] hover:bg-[#F3F9FB] rounded-lg whitespace-nowrap transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-[#F3F9FB] rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}