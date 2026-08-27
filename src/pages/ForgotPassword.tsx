import { useState } from 'react';
import { useAuth } from '../store/auth';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await requestPasswordReset(email);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <div className="container" style={{ padding: '48px 20px', maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Reset your password</h1>
      {sent ? (
        <p className="card" style={{ padding: 20 }}>If an account exists for {email}, a reset link has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Send reset link</button>
        </form>
      )}
    </div>
  );
}
