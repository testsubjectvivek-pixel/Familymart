import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import RequireAuth from './components/RequireAuth';
import PageSkeleton from './components/PageSkeleton';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-load all page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-primary-50 flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-6">
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/wishlist" element={<Wishlist />} />

                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route
                      path="/admin"
                      element={
                        <RequireAuth requireAdmin>
                          <AdminDashboard />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <RequireAuth requireAdmin>
                          <AdminProducts />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/categories"
                      element={
                        <RequireAuth requireAdmin>
                          <AdminCategories />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <RequireAuth requireAdmin>
                          <AdminOrders />
                        </RequireAuth>
                      }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>

            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
