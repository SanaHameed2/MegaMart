// src/pages/ProductDetail.tsx
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Heart, ShoppingBag, Truck, RotateCcw, Shield, Star, Check } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';
import { fetchProductReviews, submitReview } from '../lib/api';
import { GET_PRODUCT_BY_SLUG } from '../lib/graphql';
import { normalizeProduct } from '../lib/normalizers';
import type { Product } from '../lib/normalizers';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import ProductCard from '../components/ProductCard';
import { ErrorState } from '../components/States';

// ============================================================
// Related products query (GraphQL)
// ============================================================
const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($categoryId: UUID!, $excludeId: UUID!, $first: Int = 4) {
    productsCollection(
      filter: {
        category_id: { eq: $categoryId }
        id: { neq: $excludeId }
      }
      first: $first
    ) {
      edges {
        node {
          id
          nodeId
          name
          slug
          price
          compare_at_price
          stock
          rating
          review_count
          brands {
            id
            name
            slug
          }
          product_imagesCollection(
            orderBy: [{ sort_order: AscNullsLast }]
            first: 1
          ) {
            edges {
              node {
                id
                url
                sort_order
              }
            }
          }
        }
      }
    }
  }
`;

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const addItem = useCart((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlist();

  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  // ========== MAIN PRODUCT QUERY (GraphQL) ==========
  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  // ✅ Normalize right after query
  const product: Product | null = useMemo(() => {
    const edges = productData?.productsCollection?.edges ?? [];
    return edges[0] ? normalizeProduct(edges[0].node) : null;
  }, [productData]);

  // ========== RELATED PRODUCTS QUERY (GraphQL) ==========
  const { data: relatedData } = useQuery(GET_RELATED_PRODUCTS, {
    variables: {
      categoryId: product?.categoryId,
      excludeId: product?.id,
      first: 4,
    },
    skip: !product?.categoryId,
  });

  const related: Product[] = useMemo(() => {
    const edges = relatedData?.productsCollection?.edges ?? [];
    return edges.map((e: any) => normalizeProduct(e.node));
  }, [relatedData]);

  // ========== REVIEWS FETCH (still Supabase REST) ==========
  useEffect(() => {
    if (!product?.id) return;
    fetchProductReviews(product.id)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [product?.id]);

  // ========== RECENTLY VIEWED + SCROLL ==========
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    const recentRaw = localStorage.getItem('megamart_recently_viewed') || '[]';
    const recent: string[] = JSON.parse(recentRaw);
    localStorage.setItem(
      'megamart_recently_viewed',
      JSON.stringify([slug, ...recent.filter((s) => s !== slug)].slice(0, 8))
    );
  }, [slug]);

  // ========== LOADING / ERROR STATES ==========
  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#008ECC] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <ErrorState
          message={productError.message || 'Could not load this product.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">📦</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-6">
          This product may have been removed or is no longer available.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // ========== DERIVED VALUES ==========
  const images = product.images;
  const currentImage = images[activeImage]?.url || product.primaryImage;
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0;

  // ========== HANDLERS ==========
  async function handleAdd() {
    if (!product || outOfStock || addedMsg) return;
    await addItem(
      {
        productId: product.id,
        quantity: qty,
        name: product.name,
        price: product.price,
        image: currentImage,
        stock: product.stock,
      },
      user?.id ?? null
    );
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    const { error } = await submitReview(product.id, user.id, reviewRating, reviewComment);
    if (error) {
      setReviewMsg(
        error.includes('duplicate')
          ? 'You already reviewed this product.'
          : 'Only customers who purchased and received this product can leave a review.'
      );
    } else {
      setReviewMsg('Thanks — your review has been posted.');
      setReviewComment('');
      fetchProductReviews(product.id).then(setReviews);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#008ECC] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          {product.categories && (
            <>
              <Link
                to={`/category/${product.categories.slug}`}
                className="hover:text-[#008ECC] transition-colors"
              >
                {product.categories.name}
              </Link>
              <ChevronRight size={14} className="text-gray-300" />
            </>
          )}
          <span className="text-gray-800 font-medium truncate">{product.name}</span>
        </nav>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* LEFT: GALLERY */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="relative aspect-square bg-[#F3F3EE] rounded-xl overflow-hidden">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-[#C0392B] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    -{discount}% OFF
                  </span>
                )}

                {/* WISHLIST BUTTON — ✅ slug added */}
                <button
                  onClick={async () => {
                    const res = await toggle(
                      {
                        productId: product.id,
                        slug: product.slug,          // ✅ YEH ADD HUA
                        name: product.name,
                        price: product.price,
                        image: currentImage,
                        stock: product.stock,
                      },
                      user?.id ?? null
                    );
                    if (res === 'needs-auth') window.location.href = '/login';
                  }}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={wishlisted}
                  className={`absolute top-4 right-4 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
                    wishlisted ? 'text-[#C0392B]' : 'text-gray-400'
                  }`}
                >
                  <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === activeImage
                        ? 'border-[#008ECC] shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: INFO */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              {product.name}
            </h1>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? 'fill-[#F4A300] text-[#F4A300]'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* PRICE BLOCK */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                <span className="text-3xl font-bold text-[#008ECC]">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      Rs. {product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-[#C0392B] bg-red-50 px-2 py-1 rounded-lg">
                      Save Rs. {(product.compareAtPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${
                    outOfStock ? 'bg-red-50 text-[#C0392B]' : 'bg-green-50 text-[#249B3E]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      outOfStock ? 'bg-[#C0392B]' : 'bg-[#249B3E]'
                    }`}
                  ></span>
                  {outOfStock
                    ? 'Out of stock'
                    : `In stock (${product.stock} available)`}
                </span>
                {product.sku && (
                  <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* QUANTITY */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={outOfStock || qty <= 1}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span
                  aria-live="polite"
                  className="w-16 text-center font-semibold text-gray-800"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={outOfStock || qty >= product.stock}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock || addedMsg}
                className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                  outOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : addedMsg
                    ? 'bg-[#249B3E] text-white scale-[1.02] cursor-default shadow-lg'
                    : 'bg-[#008ECC] text-white hover:bg-[#0077B6] hover:shadow-lg'
                }`}
              >
                {outOfStock ? (
                  'Out of Stock'
                ) : addedMsg ? (
                  <>
                    <Check size={18} strokeWidth={3} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Add to Cart
                  </>
                )}
              </button>
              <Link
                to="/cart"
                onClick={handleAdd}
                className={`flex-1 py-4 rounded-xl font-semibold text-center transition-colors ${
                  outOfStock
                    ? 'bg-gray-100 text-gray-400 pointer-events-none'
                    : 'bg-[#F4A300] text-white hover:bg-[#E09500]'
                }`}
              >
                Buy Now
              </Link>
            </div>

            {addedMsg && (
              <div className="bg-green-50 border border-green-200 text-[#249B3E] text-sm font-medium px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <Check size={16} strokeWidth={3} />
                Added to your cart successfully!
              </div>
            )}

            {/* TRUST BADGES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-[#008ECC] mb-2" />
                <p className="text-xs font-semibold text-gray-800 mb-0.5">Free Delivery</p>
                <p className="text-xs text-gray-500">2-5 business days</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 text-[#008ECC] mb-2" />
                <p className="text-xs font-semibold text-gray-800 mb-0.5">7-Day Returns</p>
                <p className="text-xs text-gray-500">Easy returns</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center">
                <Shield className="w-6 h-6 text-[#008ECC] mb-2" />
                <p className="text-xs font-semibold text-gray-800 mb-0.5">Warranty</p>
                <p className="text-xs text-gray-500">1-year coverage</p>
              </div>
            </div>

            {/* SPECIFICATIONS */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#008ECC] rounded-full"></span>
                  Specifications
                </h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between py-2.5 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-500">{k}</span>
                      <span className="text-sm font-medium text-gray-800">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* REVIEWS */}
        <section className="mt-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#008ECC] rounded-full"></span>
              Customer Reviews
            </h2>

            {reviews.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-gray-500">
                  No reviews yet — be the first to share your experience.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-[#FAFAF7] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#008ECC] flex items-center justify-center text-white font-bold">
                        {(r.profiles?.full_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {r.profiles?.full_name || 'Customer'}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < r.rating
                                  ? 'fill-[#F4A300] text-[#F4A300]'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {user ? (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-[#FAFAF7] rounded-xl p-6 max-w-2xl"
              >
                <h3 className="font-bold text-gray-800 mb-4">Write a Review</h3>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={
                          n <= reviewRating
                            ? 'fill-[#F4A300] text-[#F4A300]'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#008ECC] focus:ring-2 focus:ring-[#008ECC]/10 transition-all mb-4"
                />

                <button
                  type="submit"
                  className="bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
                >
                  Submit Review
                </button>

                {reviewMsg && (
                  <p
                    className={`text-sm mt-3 ${
                      reviewMsg.includes('Thanks')
                        ? 'text-[#249B3E]'
                        : 'text-[#C0392B]'
                    }`}
                  >
                    {reviewMsg}
                  </p>
                )}
              </form>
            ) : (
              <div className="bg-[#FAFAF7] rounded-xl p-6 text-center max-w-2xl">
                <p className="text-sm text-gray-600">
                  <Link
                    to="/login"
                    className="text-[#008ECC] font-semibold hover:underline"
                  >
                    Sign in
                  </Link>{' '}
                  to leave a review.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#008ECC] rounded-full"></span>
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}