import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { supabase } from '../lib/supabase';

export default function Header() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const cartCount = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const wishlistCount = useWishlist((s) => s.items.length);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (query.trim().length < 2) { setSuggestions([]); return; }
      const { data } = await supabase
        .from('products')
        .select('id, name, slug')
        .eq('status', 'published')
        .ilike('name', `%${query.trim()}%`)
        .limit(6);
      setSuggestions(data ?? []);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const recents = JSON.parse(localStorage.getItem('megamart_recent_searches') || '[]');
    localStorage.setItem(
      'megamart_recent_searches',
      JSON.stringify([query, ...recents.filter((r: string) => r !== query)].slice(0, 6))
    );
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, height: 'var(--header-h)' }}>
        <Link to="/" aria-label="MegaMart home" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--color-primary)' }}>Mega</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--color-accent)' }}>Mart</span>
        </Link>

        <button
          className="btn btn-outline btn-sm"
          style={{ display: 'none' }}
          aria-hidden
        />

        <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 560 }}>
          <form onSubmit={submitSearch} role="search">
            <label htmlFor="site-search" className="visually-hidden">Search products</label>
            <input
              id="site-search"
              className="input"
              type="search"
              placeholder="Search for products, brands and categories"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="card"
              style={{ position: 'absolute', top: '110%', left: 0, right: 0, listStyle: 'none', margin: 0, padding: 6, zIndex: 50 }}
            >
              {suggestions.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/products/${s.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    style={{ display: 'block', padding: '8px 10px', borderRadius: 6 }}
                    className="suggestion-item"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Account actions" style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 'auto', flexShrink: 0 }}>
          <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} style={{ position: 'relative', fontSize: 13, fontWeight: 600 }}>
            Wishlist
            {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
          </Link>
          <Link to="/cart" aria-label={`Cart, ${cartCount} items`} style={{ position: 'relative', fontSize: 13, fontWeight: 600 }}>
            Cart
            {cartCount > 0 && <CountBadge n={cartCount} />}
          </Link>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
                {profile?.full_name?.split(' ')[0] || 'Account'}
              </button>
              {menuOpen && (
                <div role="menu" className="card" style={{ position: 'absolute', right: 0, top: '110%', minWidth: 180, padding: 6, zIndex: 50 }}>
                  <Link role="menuitem" to="/account" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 10px' }}>My Account</Link>
                  <Link role="menuitem" to="/account/orders" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 10px' }}>Orders</Link>
                  {profile?.is_admin && (
                    <Link role="menuitem" to="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 10px' }}>Admin Dashboard</Link>
                  )}
                  <button role="menuitem" onClick={() => { signOut(); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none' }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </nav>
      </div>
      <CategoryBar />
    </header>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span
      style={{
        position: 'absolute', top: -10, right: -14, background: 'var(--color-accent)',
        color: 'var(--color-accent-ink)', fontSize: 10, fontWeight: 700,
        borderRadius: 999, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
      }}
    >
      {n}
    </span>
  );
}

function CategoryBar() {
  const [cats, setCats] = useState<{ name: string; slug: string }[]>([]);
  useEffect(() => {
    supabase.from('categories').select('name, slug').is('parent_id', null).order('sort_order').then(({ data }) => {
      if (data) setCats(data);
    });
  }, []);
  if (cats.length === 0) return null;
  return (
    <div style={{ borderTop: '1px solid var(--color-border)' }}>
      <nav aria-label="Categories" className="container" style={{ display: 'flex', gap: 20, overflowX: 'auto', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
        {cats.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} style={{ whiteSpace: 'nowrap', color: 'var(--color-ink-soft)' }}>
            {c.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
