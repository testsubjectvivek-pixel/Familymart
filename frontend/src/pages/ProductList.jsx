import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 12 }).map((_, i) => (
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

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [searchParams.toString()]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchParams.toString()]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 12);
      if (searchParams.get('category')) params.set('category', searchParams.get('category'));
      if (searchParams.get('minPrice')) params.set('minPrice', searchParams.get('minPrice'));
      if (searchParams.get('maxPrice')) params.set('maxPrice', searchParams.get('maxPrice'));
      if (searchParams.get('sortBy')) params.set('sortBy', searchParams.get('sortBy'));
      if (searchParams.get('order')) params.set('order', searchParams.get('order'));
      if (searchParams.get('q')) params.set('q', searchParams.get('q'));

      const response = await api.get(`/products?${params.toString()}`, { skipCache: true });
      const data = response.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
      setTotalPages(data.pages || data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
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

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterChange = useCallback((e) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (e.target.value === '') {
      newParams.delete(e.target.name);
    } else {
      newParams.set(e.target.name, e.target.value);
    }
    navigate(`/products?${newParams.toString()}`);
  }, [searchParams, navigate]);

  const handlePriceFilter = useCallback((e) => {
    e.preventDefault();
    const minPrice = e.target.minPrice.value;
    const maxPrice = e.target.maxPrice.value;
    const newParams = new URLSearchParams(searchParams.toString());
    if (minPrice) newParams.set('minPrice', minPrice); else newParams.delete('minPrice');
    if (maxPrice) newParams.set('maxPrice', maxPrice); else newParams.delete('maxPrice');
    navigate(`/products?${newParams.toString()}`);
  }, [searchParams, navigate]);

  const handleSortChange = useCallback((e) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const [sortBy, order] = e.target.value.split(':');
    newParams.set('sortBy', sortBy);
    newParams.set('order', order || 'asc');
    navigate(`/products?${newParams.toString()}`);
  }, [searchParams, navigate]);

  const clearFilters = useCallback(() => navigate('/products'), [navigate]);

  const currentSortValue = `${searchParams.get('sortBy') || 'createdAt'}:${searchParams.get('order') || 'desc'}`;
  const hasActiveFilters = searchParams.get('category') || searchParams.get('minPrice') || searchParams.get('maxPrice') || searchParams.get('q');

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>
        <button
          onClick={() => navigate('/cart')}
          className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          View Cart
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
            <input
              type="text"
              name="q"
              placeholder="Search products"
              className="form-input w-full text-sm"
              defaultValue={searchParams.get('q') || ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newParams = new URLSearchParams(searchParams.toString());
                  if (e.target.value) newParams.set('q', e.target.value); else newParams.delete('q');
                  navigate(`/products?${newParams.toString()}`);
                }
              }}
              onBlur={(e) => {
                const newParams = new URLSearchParams(searchParams.toString());
                if (e.target.value) newParams.set('q', e.target.value); else newParams.delete('q');
                navigate(`/products?${newParams.toString()}`);
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <select
              name="category"
              value={searchParams.get('category') || ''}
              onChange={handleFilterChange}
              className="form-input w-full text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</label>
            <form onSubmit={handlePriceFilter} className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                min="0"
                className="form-input w-20 text-sm"
                defaultValue={searchParams.get('minPrice') || ''}
              />
              <span className="text-gray-400 text-sm">–</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                min="0"
                className="form-input w-20 text-sm"
                defaultValue={searchParams.get('maxPrice') || ''}
              />
              <button type="submit" className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                Go
              </button>
            </form>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
            <select
              name="sortBy"
              value={currentSortValue}
              onChange={handleSortChange}
              className="form-input w-full text-sm"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="name:asc">Name (A–Z)</option>
              <option value="name:desc">Name (Z–A)</option>
              <option value="price:asc">Price (Low → High)</option>
              <option value="price:desc">Price (High → Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          <button onClick={clearFilters} className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="mt-10 flex justify-center">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Next →
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductList;
