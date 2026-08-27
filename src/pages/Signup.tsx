import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) { setError(error); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="container" style={{ padding: '48px 20px', maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Check your inbox</h1>
        <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20 }}>We've sent a confirmation link to {email}. Confirm your email, then sign in.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to sign in</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 20px', maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Create your account</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
        <label htmlFor="fullName" className="label">Full name</label>
        <input id="fullName" required className="input" style={{ marginBottom: 14 }} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <label htmlFor="email" className="label">Email</label>
        <input id="email" type="email" required className="input" style={{ marginBottom: 14 }} value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password" className="label">Password</label>
        <input id="password" type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16, textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
