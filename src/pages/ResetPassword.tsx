import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="container" style={{ padding: '48px 20px', maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Password updated</h1>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign in</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 20px', maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Choose a new password</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Update password</button>
      </form>
    </div>
  );
}
