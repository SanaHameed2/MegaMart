import { useAuth } from '../store/auth';
import { useWishlist } from '../store/wishlist';
import { useCart } from '../store/cart';
import { EmptyState } from '../components/States';

export default function Wishlist() {
  const { user } = useAuth();
  const { items, toggle } = useWishlist();
  const addItem = useCart((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '32px 20px' }}>
        <EmptyState title="Your wishlist is empty" message="Save products you love to find them here later." actionLabel="Start shopping" actionTo="/" />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Your wishlist</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item) => (
          <div key={item.productId} className="card" style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
            <img src={item.image || '/assets/placeholder-product.svg'} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
              <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>
                Rs. {item.price.toLocaleString()} {item.stock <= 0 && <span style={{ color: 'var(--color-danger)' }}>· Out of stock</span>}
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              disabled={item.stock <= 0}
              onClick={() => addItem({ productId: item.productId, quantity: 1, name: item.name, price: item.price, image: item.image, stock: item.stock }, user?.id ?? null)}
            >
              Move to cart
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => toggle(item, user?.id ?? null)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
