import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const addItem = useCart((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlist();

  const image = product.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url
    || '/assets/placeholder-product.svg';
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    await addItem(
      { productId: product.id, quantity: 1, name: product.name, price: product.price, image, stock: product.stock },
      user?.id ?? null
    );
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    const result = await toggle(
      { productId: product.id, name: product.name, price: product.price, image, stock: product.stock },
      user?.id ?? null
    );
    if (result === 'needs-auth') window.location.href = '/login';
  }

  return (
    <Link to={`/products/${product.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#F3F3EE' }}>
        <img src={image} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {discount > 0 && <span className="badge badge-sale" style={{ position: 'absolute', top: 10, left: 10 }}>-{discount}%</span>}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          style={{
            position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%',
            border: 'none', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: wishlisted ? 'var(--color-danger)' : 'var(--color-ink-soft)',
          }}
        >
          {wishlisted ? '♥' : '♡'}
        </button>
        {outOfStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="badge badge-out">Out of stock</span>
          </div>
        )}
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, minHeight: 34 }}>{product.name}</span>
        {product.review_count > 0 && (
          <span style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>★ {product.rating.toFixed(1)} ({product.review_count})</span>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 'auto' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Rs. {product.price.toLocaleString()}</span>
          {product.compare_at_price && (
            <span style={{ fontSize: 12, color: 'var(--color-ink-soft)', textDecoration: 'line-through' }}>
              Rs. {product.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="btn btn-primary btn-sm btn-block"
          style={{ marginTop: 6 }}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
}
