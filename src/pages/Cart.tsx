import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { EmptyState } from '../components/States';

export default function Cart() {
  const { user } = useAuth();
  const { lines, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (lines.length === 0) {
    return (
      <div className="container" style={{ padding: '32px 20px' }}>
        <EmptyState title="Your cart is empty" message="Discover products you'll love." actionLabel="Start shopping" actionTo="/" />
      </div>
    );
  }

  const shipping = 150;
  const total = subtotal() + shipping;

  return (
    <div className="container" style={{ padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>Your cart</h1>
        <div style={{ display: 'grid', gap: 12 }}>
          {lines.map((line) => (
            <div key={line.productId} className="card" style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
              <img src={line.image || '/assets/placeholder-product.svg'} alt={line.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{line.name}</p>
                <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>Rs. {line.price.toLocaleString()}</p>
                {line.quantity > line.stock && (
                  <p style={{ fontSize: 12, color: 'var(--color-danger)' }}>Only {line.stock} left in stock — quantity adjusted at checkout.</p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-outline btn-sm" aria-label="Decrease quantity" onClick={() => updateQuantity(line.productId, line.quantity - 1, user?.id ?? null)}>−</button>
                <span aria-live="polite" style={{ minWidth: 20, textAlign: 'center' }}>{line.quantity}</span>
                <button className="btn btn-outline btn-sm" aria-label="Increase quantity" onClick={() => updateQuantity(line.productId, line.quantity + 1, user?.id ?? null)}>+</button>
              </div>
              <p style={{ fontWeight: 700, minWidth: 90, textAlign: 'right' }}>Rs. {(line.price * line.quantity).toLocaleString()}</p>
              <button className="btn btn-outline btn-sm" onClick={() => removeItem(line.productId, user?.id ?? null)} aria-label={`Remove ${line.name}`}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <aside className="card" style={{ padding: 20, height: 'fit-content' }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Order summary</h2>
        <Row label="Subtotal" value={subtotal()} />
        <Row label="Shipping" value={shipping} />
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />
        <Row label="Total" value={total} bold />
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 16 }}
          onClick={() => navigate(user ? '/checkout' : '/login?redirect=/checkout')}
        >
          Proceed to checkout
        </button>
        <Link to="/" style={{ display: 'block', textAlign: 'center', fontSize: 13, marginTop: 12, color: 'var(--color-ink-soft)' }}>Continue shopping</Link>
      </aside>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 400, marginBottom: 8 }}>
      <span>{label}</span>
      <span>Rs. {value.toLocaleString()}</span>
    </div>
  );
}
