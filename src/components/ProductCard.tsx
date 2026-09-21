// src/components/ProductCard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Check } from 'lucide-react';
import type { Product } from '../lib/normalizers';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const addItem = useCart((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlist();

  // Track "just added" state for button feedback
  const [justAdded, setJustAdded] = useState(false);

  // Normalized fields (camelCase from normalizer)
  const image = product.primaryImage;
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0;
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || justAdded) return;

    await addItem(
      {
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        image,
        stock: product.stock,
      },
      user?.id ?? null
    );

    // Show success feedback for 2 seconds
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(
      {
        productId: product.id,
        slug: product.slug,          // ✅ YEH ADD HUA
        name: product.name,
        price: product.price,
        image,
        stock: product.stock,
      },
      user?.id ?? null
    );
    if (result === 'needs-auth') window.location.href = '/login';
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden relative transition-all duration-200 hover:shadow-[0_8px_24px_rgba(20,35,29,0.15)] hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="relative aspect-square bg-[#F3F3EE] overflow-hidden">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/assets/placeholder-product.svg';
          }}
        />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="badge badge-sale absolute top-3 left-3 z-10">
            -{discount}%
          </span>
        )}

        {/* Low stock badge */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="badge badge-stock-low absolute bottom-3 left-3 z-10">
            Only {product.stock} left
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full border-none bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:bg-white shadow-sm"
          style={{
            color: wishlisted ? 'var(--color-danger)' : 'var(--color-ink-soft)',
          }}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="badge badge-out text-base px-4 py-2 bg-white/90 shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-4 flex flex-col gap-1.5 flex-1 bg-white">
        <h3 className="text-sm font-semibold leading-tight min-h-[34px] line-clamp-2 text-ink">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <span className="text-xs text-ink-soft flex items-center gap-1">
            <Star size={12} className="fill-[#F4A300] text-[#F4A300]" />
            {product.rating.toFixed(1)}
            <span className="text-ink-soft/60">({product.reviewCount})</span>
          </span>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className="font-bold text-base text-ink">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-ink-soft line-through">
              Rs. {product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to cart button with feedback */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock || justAdded}
          className={`
            btn btn-sm btn-block mt-1.5
            transition-all duration-300
            ${
              outOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200'
                : justAdded
                ? 'bg-[#249B3E] text-white scale-[1.02] cursor-default'
                : 'btn-primary'
            }
          `}
        >
          {outOfStock ? (
            'Out of Stock'
          ) : justAdded ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check size={14} strokeWidth={3} />
              Added
            </span>
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </Link>
  );
}