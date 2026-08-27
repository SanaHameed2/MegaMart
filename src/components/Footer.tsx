import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{ background: 'var(--color-primary)', color: '#EDF2EE', marginTop: 60 }}>
      <div className="container" style={{ padding: '48px 20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 12 }}>MegaMart</h3>
          <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>
            Everyday essentials to the latest electronics — delivered fast, priced fair.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, opacity: 0.7 }}>Shop</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8, fontSize: 13 }}>
            <li><a href="/category/electronics">Electronics</a></li>
            <li><a href="/category/fashion">Fashion</a></li>
            <li><a href="/category/groceries">Groceries</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, opacity: 0.7 }}>Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8, fontSize: 13 }}>
            <li><a href="/account/orders">Track order</a></li>
            <li><a href="/account">My account</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, opacity: 0.7 }}>Stay in the loop</h4>
          {subscribed ? (
            <p style={{ fontSize: 13 }}>You're subscribed. Deals land in your inbox soon.</p>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
              style={{ display: 'flex', gap: 8 }}
            >
              <label htmlFor="newsletter-email" className="visually-hidden">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
              />
              <button type="submit" className="btn btn-accent btn-sm">Join</button>
            </form>
          )}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', fontSize: 12, opacity: 0.7, padding: '16px 20px' }}>
        © {new Date().getFullYear()} MegaMart. All rights reserved.
      </div>
    </footer>
  );
}
