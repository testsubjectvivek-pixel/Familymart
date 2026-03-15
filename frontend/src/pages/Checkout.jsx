import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// ─── Step indicator ───────────────────────────────────────────────────────────
const steps = ['Cart', 'Shipping', 'Confirm'];
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, i) => (
      <div key={step} className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
          i < current ? 'bg-green-500 text-white' :
          i === current ? 'bg-primary-600 text-white' :
          'bg-gray-200 text-gray-500'
        }`}>
          {i < current ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : i + 1}
        </div>
        <span className={`ml-2 text-sm font-medium ${i === current ? 'text-primary-600' : 'text-gray-400'}`}>
          {step}
        </span>
        {i < steps.length - 1 && (
          <div className={`mx-4 h-0.5 w-12 ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </div>
    ))}
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const items = cartItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', { items, address, couponCode: couponCode || undefined });
      setOrderId(response.data._id);
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Nothing to checkout</h1>
        <p className="text-gray-500 mb-8">Your cart is empty. Add some products first!</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Order Placed!</h1>
          <p className="text-gray-500 mb-1">Thank you for your order.</p>
          <p className="text-sm text-gray-400 mb-8">
            Order ID: <span className="font-mono font-semibold text-gray-600">{orderId}</span>
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-green-700 font-medium">What happens next?</p>
            <ul className="mt-2 space-y-1 text-sm text-green-600">
              <li>• Your order is being processed</li>
              <li>• You'll receive a confirmation shortly</li>
              <li>• Delivery will be made to your address</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
            >
              Back to Home
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/orders')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                View Orders
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const applyCoupon = async () => {
    setCouponMessage('');
    try {
      const res = await api.post('/coupons/apply', { code: couponCode, total: cartTotal });
      setDiscount(res.data.discount || 0);
      setCouponMessage(`Coupon applied. You save $${(res.data.discount || 0).toFixed(2)}`);
    } catch (err) {
      setDiscount(0);
      setCouponMessage(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const totalAfterDiscount = Math.max(0, cartTotal - discount);

  return (
    <div className="animate-fade-in">
      <StepIndicator current={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Shipping Information
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="4"
                  className="form-input w-full resize-none"
                  placeholder="Enter your full address including street, city, state, and zip code"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Method
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" id="cod" name="payment" value="cod" defaultChecked className="text-primary-600 w-4 h-4" />
                  <div>
                    <span className="font-medium text-gray-800">Cash on Delivery</span>
                    <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="w-full bg-primary-600 text-white py-3.5 rounded-xl hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order · ${cartTotal.toFixed(2)}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-5">
              Order Summary
              <span className="ml-2 text-sm font-normal text-gray-400">({cartItems.length} items)</span>
            </h2>

            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div key={item.product._id} className="flex items-center gap-3">
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-10 h-10 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">
                    ${((item.product.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-xl text-primary-600">${totalAfterDiscount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Coupon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-input flex-1 text-sm"
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Apply
                </button>
              </div>
              {couponMessage && <p className="text-xs text-primary-600 mt-1">{couponMessage}</p>}
            </div>

            <Link
              to="/cart"
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 justify-center"
            >
              ← Edit cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
