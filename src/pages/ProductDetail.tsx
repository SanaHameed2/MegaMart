import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductBySlug, fetchRelatedProducts, fetchProductReviews, submitReview } from '../lib/api';
import type { Product } from '../types';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import ProductCard from '../components/ProductCard';
import { ErrorState } from '../components/States';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const addItem = useCart((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [addedMsg, setAddedMsg] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  async function load() {
    if (!slug) return;
    setError(null);
    try {
      const p = await fetchProductBySlug(slug);
      setProduct(p);
      if (p) {
        const [rel, revs] = await Promise.all([
          fetchRelatedProducts(p.category_id, p.id),
          fetchProductReviews(p.id),
        ]);
        setRelated(rel);
        setReviews(revs);

        const recentRaw = localStorage.getItem('megamart_recently_viewed') || '[]';
        const recent: string[] = JSON.parse(recentRaw);
        localStorage.setItem('megamart_recently_viewed', JSON.stringify([slug, ...recent.filter((s) => s !== slug)].slice(0, 8)));
      }
    } catch {
      setError('Could not load this product.');
    }
  }

  useEffect(() => { load(); window.scrollTo(0, 0); }, [slug]);

  if (error) return <div className="container" style={{ padding: 40 }}><ErrorState message={error} onRetry={load} /></div>;
  if (product === undefined) return <div className="container" style={{ padding: 40 }}>Loading…</div>;
  if (product === null) return (
    <div className="container" style={{ padding: 40, textAlign: 'center' }}>
      <h2>Product not found</h2>
      <p style={{ color: 'var(--color-ink-soft)', margin: '8px 0 20px' }}>This product may have been removed or is no longer available.</p>
      <Link to="/" className="btn btn-primary">Continue shopping</Link>
    </div>
  );

  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const currentImage = images[activeImage]?.url || '/assets/placeholder-product.svg';
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  async function handleAdd() {
    if (!product || outOfStock) return;
    await addItem({ productId: product.id, quantity: qty, name: product.name, price: product.price, image: currentImage, stock: product.stock }, user?.id ?? null);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    const { error } = await submitReview(product.id, user.id, reviewRating, reviewComment);
    if (error) {
      setReviewMsg(error.includes('duplicate') ? 'You already reviewed this product.' : 'Only customers who purchased and received this product can leave a review.');
    } else {
      setReviewMsg('Thanks — your review has been posted.');
      setReviewComment('');
      fetchProductReviews(product.id).then(setReviews);
    }
  }

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 20 }}>
        <Link to="/">Home</Link> / {product.categories && <Link to={`/category/${product.categories.slug}`}>{product.categories.name}</Link>} / {product.name}
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <div className="card" style={{ aspectRatio: '1/1', overflow: 'hidden', marginBottom: 12 }}>
            <img src={currentImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImage(i)} aria-label={`View image ${i + 1}`}
                  style={{ width: 64, height: 64, border: i === activeImage ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', padding: 0 }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>{product.name}</h1>
          {product.review_count > 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 12 }}>★ {product.rating.toFixed(1)} · {product.review_count} reviews</p>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700 }}>Rs. {product.price.toLocaleString()}</span>
            {product.compare_at_price && <span style={{ fontSize: 16, color: 'var(--color-ink-soft)', textDecoration: 'line-through' }}>Rs. {product.compare_at_price.toLocaleString()}</span>}
          </div>
          <p style={{ fontSize: 13, marginBottom: 20, color: outOfStock ? 'var(--color-danger)' : 'var(--color-primary)' }}>
            {outOfStock ? 'Out of stock' : `In stock (${product.stock} available)`} {product.sku && `· SKU: ${product.sku}`}
          </p>

          <p style={{ marginBottom: 20, color: 'var(--color-ink-soft)', lineHeight: 1.6 }}>{product.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <label htmlFor="qty" className="label" style={{ margin: 0 }}>Qty</label>
            <select id="qty" className="input" style={{ width: 80 }} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={outOfStock}>
              {Array.from({ length: Math.min(product.stock, 10) || 1 }).map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={outOfStock} onClick={handleAdd}>
              {outOfStock ? 'Notify Me' : 'Add to Cart'}
            </button>
            <Link to="/cart" className="btn btn-accent" style={{ flex: 1, opacity: outOfStock ? 0.5 : 1, pointerEvents: outOfStock ? 'none' : 'auto' }} onClick={handleAdd}>
              Buy Now
            </Link>
            <button
              className="btn btn-outline"
              aria-pressed={wishlisted}
              onClick={async () => {
                const res = await toggle({ productId: product.id, name: product.name, price: product.price, image: currentImage, stock: product.stock }, user?.id ?? null);
                if (res === 'needs-auth') window.location.href = '/login';
              }}
            >
              {wishlisted ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
          {addedMsg && <p role="status" style={{ fontSize: 13, color: 'var(--color-primary)' }}>Added to your cart.</p>}

          {Object.keys(product.specifications || {}).length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Specifications</h3>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <tr key={k} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--color-ink-soft)' }}>{k}</td>
                      <td style={{ padding: '8px 0', fontWeight: 500 }}>{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 24, fontSize: 13, color: 'var(--color-ink-soft)', display: 'grid', gap: 6 }}>
            <p>🚚 Delivery in 2–5 business days across Pakistan.</p>
            <p>↩ 7-day return policy on unused items.</p>
            <p>🛡 1-year manufacturer warranty where applicable.</p>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Customer reviews</h2>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20 }}>No reviews yet — be the first to share your experience.</p>
        ) : (
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: 16 }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>★ {r.rating} · {r.profiles?.full_name || 'Customer'}</p>
                {r.comment && <p style={{ fontSize: 13, marginTop: 6, color: 'var(--color-ink-soft)' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {user ? (
          <form onSubmit={handleReviewSubmit} className="card" style={{ padding: 16, maxWidth: 480 }}>
            <p className="label">Rate this product</p>
            <select className="input" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={{ marginBottom: 10, width: 100 }}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <label htmlFor="comment" className="label">Your review</label>
            <textarea id="comment" className="input" rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ marginBottom: 10 }} />
            <button className="btn btn-primary btn-sm" type="submit">Submit review</button>
            {reviewMsg && <p role="status" style={{ fontSize: 13, marginTop: 8 }}>{reviewMsg}</p>}
          </form>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}><Link to="/login">Sign in</Link> to leave a review.</p>
        )}
      </section>

      {related.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Related products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
