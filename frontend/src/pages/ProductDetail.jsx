import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Stars from '../components/Stars';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
    <div className="h-96 skeleton rounded-xl" />
    <div className="space-y-4">
      <div className="h-8 skeleton rounded w-3/4" />
      <div className="h-6 skeleton rounded w-1/4" />
      <div className="h-4 skeleton rounded w-full" />
      <div className="h-4 skeleton rounded w-5/6" />
      <div className="h-4 skeleton rounded w-4/6" />
      <div className="h-24 skeleton rounded-lg" />
      <div className="flex gap-4">
        <div className="h-12 skeleton rounded-lg flex-1" />
        <div className="h-12 skeleton rounded-lg flex-1" />
      </div>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    setQuantity(1);
    setImgError(false);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      const rev = await api.get(`/products/${id}/reviews`);
      setReviews(rev.data || []);
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = useCallback(() => {
    addToCart(product, quantity);
    setCartMessage(`${product.name} added to cart!`);
    setTimeout(() => setCartMessage(''), 2500);
  }, [addToCart, product, quantity]);

  const submitReview = async () => {
    setReviewError('');
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      const rev = await api.get(`/products/${id}/reviews`);
      setReviews(rev.data || []);
      setReviewForm({ rating: 5, comment: '' });
      fetchProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to add review');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-6">The product you are looking for does not exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="animate-fade-in">
      {/* Cart feedback toast */}
      {cartMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-down flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {cartMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square max-h-96">
            {product.imageUrl && !imgError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-full">Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {/* Category badge */}
          {product.category?.name && (
            <Link
              to={`/products?category=${encodeURIComponent(product.category.name)}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full w-fit mb-3 hover:bg-primary-100 transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-primary-600">
              ${(product.price ?? 0).toFixed(2)}
            </span>
            {product.avgRating > 0 && (
              <div className="flex items-center gap-2">
                <Stars value={product.avgRating} />
                <span className="text-sm text-gray-500">({product.numReviews || 0} reviews)</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-orange-400' : 'bg-green-500'}`} />
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
              {isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${product.stock} left!` : `${product.stock} in stock`}
            </span>
          </div>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="flex-1 py-3 rounded-xl font-semibold border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              className="form-input text-sm w-28"
            >
              {[5,4,3,2,1].map((r) => (
                <option key={r} value={r}>{r} Stars</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Write a review..."
              className="form-input text-sm w-64"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            />
            <button
              onClick={submitReview}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              Submit
            </button>
          </div>
        </div>
        {reviewError && <p className="text-red-600 text-sm mb-3">{reviewError}</p>}
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <Stars value={rev.rating} />
                  <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
