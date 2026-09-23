// src/pages/Account.tsx
import { NavLink, Outlet } from 'react-router-dom';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { to: '/account', label: 'Profile', icon: User, end: true },
    { to: '/account/orders', label: 'Orders', icon: Package },
    { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  ];

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <NavLink to="/" className="hover:text-[#008ECC] transition-colors">
            Home
          </NavLink>
          <span>/</span>
          <span className="text-gray-800 font-medium">My Account</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-[#008ECC] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">
                    {profile?.full_name || 'My Account'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  return (
                    <NavLink
                      key={t.to}
                      to={t.to}
                      end={t.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-[#008ECC] text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <Icon size={18} />
                      {t.label}
                    </NavLink>
                  );
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#C0392B] hover:bg-red-50 transition-all mt-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}