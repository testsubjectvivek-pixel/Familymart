import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

// ─── Skeleton components ──────────────────────────────────────────────────────
const CarouselSkeleton = () => (
  <div className="relative h-96 bg-gray-200 skeleton" />
);

const CategorySkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-24 skeleton rounded-lg" />
    ))}
  </div>
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-48 skeleton" />
        <div className="p-4 space-y-3">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-full" />
          <div className="h-3 skeleton rounded w-2/3" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-5 skeleton rounded w-16" />
            <div className="h-8 skeleton rounded w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]);
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.min(products.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=8');
      const data = response.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data;
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = useCallback((product) => {
    addToCart(product);
    setCartMessage(`${product.name} added to cart!`);
    setTimeout(() => setCartMessage(''), 2500);
  }, [addToCart]);

  const carouselProducts = products.slice(0, 5);

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

      {/* Carousel Banner */}
      {loading ? (
        <CarouselSkeleton />
      ) : carouselProducts.length > 0 ? (
        <section className="relative h-96 overflow-hidden bg-gray-900">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselProducts.map((product) => (
              <div key={product._id} className="min-w-full h-full relative">
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/1200x400'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-start p-8 md:p-12">
                  <div className="text-white max-w-lg">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow">{product.name}</h2>
                    <p className="text-xl font-semibold mb-4 text-primary-300">${(product.price ?? 0).toFixed(2)}</p>
                    <Link
                      to={`/products/${product._id}`}
                      className="inline-block bg-white text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                    >
                      Shop Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2.5 rounded-full transition-colors"
            onClick={() => setCurrentSlide(prev => (prev - 1 + carouselProducts.length) % carouselProducts.length)}
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2.5 rounded-full transition-colors"
            onClick={() => setCurrentSlide(prev => (prev + 1) % carouselProducts.length)}
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-white w-6 h-2' : 'bg-white/50 w-2 h-2'
                }`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          {loading ? (
            <CategorySkeleton />
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(category => (
                <Link
                  key={category._id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'M5 13l4 4L19 7',
                title: 'Quality Products',
                desc: 'We source only the finest products for our customers.',
                color: 'bg-primary-100 text-primary-600'
              },
              {
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Fast Delivery',
                desc: 'Get your orders delivered quickly and safely.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
                title: 'Secure Payment',
                desc: 'Your transactions are safe and secure.',
                color: 'bg-purple-100 text-purple-600'
              }
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="text-center group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${color} group-hover:scale-110 transition-transform duration-200`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
