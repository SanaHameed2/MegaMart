import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { supabase } from '../lib/supabase';

export default function Login() {
  const { signIn } = useAuth();
  const mergeGuestCart = useCart((s) => s.mergeGuestCartIntoAccount);
  const hydrateWishlist = useWishlist((s) => s.hydrate);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await mergeGuestCart(data.user.id);
      await hydrateWishlist(data.user.id);
    }
    navigate(params.get('redirect') || '/account');
  }

  return (
    <div className="container" style={{ padding: '48px 20px', maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Sign in</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" type="email" required className="input" style={{ marginBottom: 14 }} value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password" className="label">Password</label>
        <input id="password" type="password" required className="input" style={{ marginBottom: 8 }} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--color-primary)' }}>Forgot password?</Link>
        {error && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16, textAlign: 'center' }}>
        New to MegaMart? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create an account</Link>
      </p>
    </div>
  );
}
