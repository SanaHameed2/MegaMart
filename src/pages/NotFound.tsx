import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 72, color: 'var(--color-primary)', marginBottom: 8 }}>404</h1>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Page not found</h2>
      <p style={{ color: 'var(--color-ink-soft)', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">Back to MegaMart</Link>
        <Link to="/category/electronics" className="btn btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
