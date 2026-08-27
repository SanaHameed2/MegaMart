import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
];

export default function AdminLayout() {
  return (
    <div className="container" style={{ padding: '32px 20px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
      <aside>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Admin</h2>
        <nav style={{ display: 'grid', gap: 4 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-ink)',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div><Outlet /></div>
    </div>
  );
}
