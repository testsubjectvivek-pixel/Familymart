import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Stars from './Stars';
import api from '../services/api';

const ProductCard = memo(({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [wishAdded, setWishAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wishlist', { productId: product._id });
      setWishAdded(true);
      setTimeout(() => setWishAdded(false), 1500);
    } catch (err) {
      setWishAdded(false);
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="efficiency-card group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-primary-100 h-40">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50">
            <svg className="w-10 h-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <span className="bg-white text-primary-700 text-xs font-medium px-2 py-1 rounded-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.category?.name && (
          <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-0.5 rounded-sm font-medium">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-primary-800 mb-1 line-clamp-2 text-sm leading-tight">
          {product.name}
        </h3>
        <p className="text-primary-500 text-xs mb-2 line-clamp-2 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto space-x-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-accent leading-none">
              ${(product.price ?? 0).toFixed(2)}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-xs text-accent font-medium mt-0.5">
                Only {product.stock} left!
              </p>
            )}
            {product.avgRating > 0 && (
              <div className="mt-1 flex items-center gap-1">
                <Stars value={product.avgRating} />
                <span className="text-[11px] text-primary-400">({product.numReviews || 0})</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              isOutOfStock
                ? 'bg-primary-100 text-primary-400 cursor-not-allowed'
                : added
                ? 'bg-accent text-white opacity-90'
                : 'efficiency-button text-xs px-2 py-1'
            }`}
          >
            {added ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
        <div className="mt-2">
          <button
            onClick={handleWishlist}
            className="text-[11px] text-primary-600 hover:text-primary-800 underline"
          >
            {wishAdded ? 'Saved to wishlist' : 'Save to wishlist'}
          </button>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
