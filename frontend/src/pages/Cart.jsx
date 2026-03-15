import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some products to get started!</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <span className="text-sm text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.product._id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <Link to={`/products/${item.product._id}`} className="shrink-0">
                <img
                  src={item.product.imageUrl || 'https://via.placeholder.com/80'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </Link>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product._id}`} className="hover:text-primary-600 transition-colors">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{item.product.name}</h3>
                </Link>
                <p className="text-primary-600 font-bold mt-0.5">${(item.product.price ?? 0).toFixed(2)}</p>
                {item.product.stock <= 5 && item.product.stock > 0 && (
                  <p className="text-xs text-orange-500 mt-0.5">Only {item.product.stock} left</p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                  disabled={item.quantity >= (item.product.stock ?? Infinity)}
                  className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right shrink-0 w-20">
                <p className="font-bold text-gray-800">${((item.product.price ?? 0) * item.quantity).toFixed(2)}</p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product._id)}
                className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cart
            </button>
            <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              {cartItems.map(item => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">
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
                <span className="font-bold text-xl text-primary-600">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 bg-primary-600 text-white py-3.5 rounded-xl hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
