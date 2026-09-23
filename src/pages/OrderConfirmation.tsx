// src/pages/OrderConfirmation.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { fetchOrderById } from '../lib/api';
import { useAuth } from '../store/auth';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    if (id && user?.id) {
      fetchOrderById(id, user.id).then(setOrder);
    }
  }, [id, user?.id]);

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#008ECC] border-t-transparent" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order not found</h1>
          <p className="text-gray-500 mb-6">This order doesn't exist or you don't have access to it.</p>
          <Link
            to="/"
            className="inline-block bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-[#249B3E]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 mb-8">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          <div className="bg-[#FAFAF7] rounded-xl p-6 mb-8 text-left">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-500">Order Number</span>
              <span className="font-bold text-gray-800">{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="font-bold text-[#008ECC]">
                Rs. {Number(order.total ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Payment Method</span>
              <span className="font-semibold text-gray-800">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/account/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-2 bg-[#008ECC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077B6] transition-colors"
            >
              View Order Details
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}