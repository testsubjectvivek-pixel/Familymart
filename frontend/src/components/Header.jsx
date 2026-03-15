import { memo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';

const Header = memo(() => {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  }, [logout, navigate]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setSuggestions([]);
    }
  };

  const fetchSuggestions = useCallback(async (value) => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/products/search?q=${encodeURIComponent(value)}`);
      setSuggestions(res.data || []);
    } catch (e) {
      setSuggestions([]);
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'text-accent'
        : 'text-primary-600 hover:text-accent'
    }`;

  return (
    <header className="bg-white border-b border-primary-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-semibold text-sm">FM</span>
            </div>
            <span className="text-xl font-semibold text-primary-800">
              Family<span className="text-accent">Mart</span>
            </span>
          </Link>

          {/* Center Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                className="efficiency-input pl-10 pr-4"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-primary-100 rounded-lg shadow-md z-40">
                  {suggestions.map((s) => (
                    <button
                      key={s._id}
                      className="w-full text-left px-3 py-2 hover:bg-primary-50 text-sm text-primary-700"
                      onClick={() => {
                        setSearchQuery(s.name);
                        setSuggestions([]);
                        navigate(`/products/${s._id}`);
                      }}
                    >
                      {s.name} <span className="text-xs text-primary-400 ml-1">${s.price?.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/products" className={navLinkClass('/products')}>All Products</Link>
            <Link to="/wishlist" className={navLinkClass('/wishlist')}>Wishlist</Link>

            {isAuthenticated && isAdmin && (
              <div className="flex items-center gap-2 border-l border-primary-200 pl-4">
                <Link to="/admin" className={navLinkClass('/admin')}>Dashboard</Link>
                <Link to="/admin/products" className={navLinkClass('/admin/products')}>Manage Products</Link>
                <Link to="/admin/categories" className={navLinkClass('/admin/categories')}>Categories</Link>
                <Link to="/admin/orders" className={navLinkClass('/admin/orders')}>Orders</Link>
              </div>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Cart icon */}
            <Link
              to="/cart"
              className="relative p-2 text-primary-600 hover:text-accent transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth button - desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="efficiency-button text-sm px-3 py-1"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/admin/login"
                  className="efficiency-button text-sm px-3 py-1"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-primary-600 hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-100 py-3 space-y-1 animate-slide-down">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'All Products' },
              { to: '/wishlist', label: 'Wishlist' },
              { to: '/cart', label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}` },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-accent-50 text-accent'
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated && isAdmin && (
              <>
                <div className="border-t border-primary-100 my-2" />
                <p className="px-3 py-1 text-xs font-semibold text-primary-400 uppercase tracking-wider">Admin</p>
                {[
                  { to: '/admin', label: 'Dashboard' },
                  { to: '/admin/products', label: 'Manage Products' },
                  { to: '/admin/categories', label: 'Categories' },
                  { to: '/admin/orders', label: 'Orders' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(to)
                        ? 'bg-accent-50 text-accent'
                        : 'text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </>
            )}

            <div className="border-t border-primary-100 my-2" />
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-accent-50 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/admin/login"
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-accent-50 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
