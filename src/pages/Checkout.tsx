import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { supabase } from '../lib/supabase';
import { placeOrder, validateCoupon } from '../lib/api';
import type { Address } from '../types';

export default function Checkout() {
  const { user } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).then(({ data }) => {
      setAddresses(data ?? []);
      if (data && data[0]) setSelectedAddressId(data[0].id);
    });
  }, [user?.id]);

  if (lines.length === 0) {
    return <div className="container" style={{ padding: 40, textAlign: 'center' }}>Your cart is empty. <button className="btn btn-primary" onClick={() => navigate('/')}>Shop now</button></div>;
  }

  const shipping = 150;
  const discountAmount = coupon?.discount ?? 0;
  const total = subtotal() - discountAmount + shipping;

  async function applyCoupon() {
    setCouponError(null);
    const c = await validateCoupon(couponInput);
    if (!c) { setCouponError('Invalid or expired coupon code.'); setCoupon(null); return; }
    if (subtotal() < c.min_order_amount) {
      setCouponError(`Minimum order of Rs. ${c.min_order_amount.toLocaleString()} required for this coupon.`);
      setCoupon(null);
      return;
    }
    let discount = c.discount_type === 'percentage' ? subtotal() * c.discount_value / 100 : c.discount_value;
    if (c.max_discount) discount = Math.min(discount, c.max_discount);
    setCoupon({ code: c.code, discount });
  }

  async function handlePlaceOrder() {
    if (!user || !selectedAddressId) return;
    setPlacing(true);
    setError(null);
    try {
      const address = addresses.find((a) => a.id === selectedAddressId);
      const orderId = await placeOrder(
        lines.map((l) => ({ product_id: l.productId, quantity: l.quantity, variant_id: l.variantId ?? null })),
        address as any,
        coupon?.code ?? null,
        paymentMethod
      );
      await clear(user.id);
      navigate(`/order-confirmation/${orderId}`);
    } catch (e: any) {
      setError(e.message || 'Could not place your order. Please check stock and try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container" style={{ padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>Checkout</h1>

        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Shipping address</h2>
          {addresses.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>
              You have no saved addresses. <a href="/account/addresses" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Add one</a> before checking out.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {addresses.map((a) => (
                <label key={a.id} className="card" style={{ padding: 12, display: 'flex', gap: 10, cursor: 'pointer', borderColor: selectedAddressId === a.id ? 'var(--color-primary)' : undefined }}>
                  <input type="radio" name="address" checked={selectedAddressId === a.id} onChange={() => setSelectedAddressId(a.id)} />
                  <span style={{ fontSize: 13 }}>{a.full_name}, {a.line1}, {a.city}, {a.state} {a.postal_code} · {a.phone}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Payment method</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
            <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.5 }}>
            <input type="radio" disabled /> Card payment (coming soon — requires payment gateway credentials)
          </label>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Coupon code</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="e.g. SAVE10" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
            <button type="button" className="btn btn-outline" onClick={applyCoupon}>Apply</button>
          </div>
          {couponError && <p style={{ fontSize: 13, color: 'var(--color-danger)', marginTop: 8 }}>{couponError}</p>}
          {coupon && <p style={{ fontSize: 13, color: 'var(--color-primary)', marginTop: 8 }}>Coupon {coupon.code} applied — Rs. {coupon.discount.toLocaleString()} off.</p>}
        </section>
      </div>

      <aside className="card" style={{ padding: 20, height: 'fit-content' }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Review order</h2>
        {lines.map((l) => (
          <div key={l.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span>{l.name} × {l.quantity}</span>
            <span>Rs. {(l.price * l.quantity).toLocaleString()}</span>
          </div>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />
        <SummaryRow label="Subtotal" value={subtotal()} />
        {coupon && <SummaryRow label="Discount" value={-discountAmount} />}
        <SummaryRow label="Shipping" value={shipping} />
        <SummaryRow label="Total" value={total} bold />
        {error && <p role="alert" style={{ fontSize: 13, color: 'var(--color-danger)', marginTop: 10 }}>{error}</p>}
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 16 }}
          disabled={placing || !selectedAddressId}
          onClick={handlePlaceOrder}
        >
          {placing ? 'Placing order…' : 'Place order'}
        </button>
        <p style={{ fontSize: 11, color: 'var(--color-ink-soft)', marginTop: 8 }}>
          Prices and stock are re-verified on our server before your order is confirmed.
        </p>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, marginBottom: 6 }}>
      <span>{label}</span><span>Rs. {value.toLocaleString()}</span>
    </div>
  );
}
