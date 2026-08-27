import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Account() {
  const { profile, user } = useAuth();
  const tabs = [
    { to: '/account', label: 'Profile', end: true },
    { to: '/account/orders', label: 'Orders' },
    { to: '/account/addresses', label: 'Addresses' },
  ];
  return (
    <div className="container" style={{ padding: '32px 20px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
      <aside>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{profile?.full_name || 'My Account'}</p>
        <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginBottom: 20 }}>{user?.email}</p>
        <nav style={{ display: 'grid', gap: 4 }}>
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              style={({ isActive }) => ({
                padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-ink)',
              })}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div><Outlet /></div>
    </div>
  );
}
