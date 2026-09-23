// src/App.tsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import { useCart } from './store/cart';
import { useWishlist } from './store/wishlist';

import Layout, { RequireAuth, RequireAdmin, FullScreenSpinner } from './components/Layout';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import WishlistPage from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Account from './pages/Account';
import Profile from './pages/account/Profile';
import Orders from './pages/account/Orders';
import OrderDetail from './pages/account/OrderDetail';
import Addresses from './pages/account/Addresses';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import Categories from './pages/Categories';
import Brands from './pages/Brands';
import BrandDetail from './pages/BrandDetail';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';

export default function App() {
  const init = useAuth((s) => s.init);
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const error = useAuth((s) => s.error);
  const hydrateCart = useCart((s) => s.hydrate);
  const hydrateWishlist = useWishlist((s) => s.hydrate);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    hydrateCart(user?.id ?? null);
    hydrateWishlist(user?.id ?? null);
  }, [user?.id, hydrateCart, hydrateWishlist]);

  if (loading) return <FullScreenSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/category/:slug" element={<ProductListing />} />
        <Route path="/search" element={<ProductListing />} />
        <Route path="/products/:slug" element={<ProductDetail />} />

        <Route path="/categories" element={<Categories />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/brand/:slug" element={<BrandDetail />} />

        <Route
          path="/essentials"
          element={<Navigate to="/category/premium-fruits" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<RequireAuth />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/account" element={<Account />}>
            <Route index element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
        </Route>

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}