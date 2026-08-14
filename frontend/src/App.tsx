import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BankProvider } from './contexts/BankContext';
import LandingPage from './pages/LandingPage';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminProducts from './pages/AdminProducts';
import AdminStock from './pages/AdminStock';
import AdminOrders from './pages/AdminOrders';
import AdminPickupList from './pages/AdminPickupList';
import AdminPackingList from './pages/AdminPackingList';
import AdminPromotions from './pages/AdminPromotions';
import AdminPayments from './pages/AdminPayments';
import AdminAddProduct from './pages/AdminAddProduct';
import Storefront from './pages/Storefront';
import POSSync from './pages/POSSync';
import { AdminLayout } from './components/admin/AdminLayout';
import { useAuthStore, isAdmin } from './stores/auth.store';
import { AuthInitializer } from './components/AuthInitializer';
import { MarketplaceInitializer } from './components/MarketplaceInitializer';

// Secure Route guard for authenticated session pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated  = !!useAuthStore((state) => state.userSession);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Route guard for public-only auth routes (e.g. login, register)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated  = !!useAuthStore((state) => state.userSession);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

// Admin-only route guard — user must be authenticated AND hold the store admin role
const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.userSession?.userRole);
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin(userRole)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* E-Commerce Shopping Cart Landing Page (Default Page) */}
        <Route path="/" element={<LandingPage />} />

        {/* Product Detail Page */}
        <Route path="/product/:productId" element={<ProductDetail />} />

        {/* Store Storefront */}
        <Route path="/store" element={<Storefront />} />

        {/* Checkout & Payment Pages */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Orders Pages */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Public-only Authenticated Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Store Admin Portal Routes */}
        <Route path="/admin/login" element={<Navigate to="/" replace />} />
        <Route
          path="/admin"
          element={
            <AdminOnlyRoute>
              <AdminLayout />
            </AdminOnlyRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pos-sync" element={<POSSync />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="products/add" element={<AdminAddProduct />} />
          <Route path="products/edit/:draftId" element={<AdminAddProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="pickup-list" element={<AdminPickupList />} />
          <Route path="packing-list" element={<AdminPackingList />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all redirects to home landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
      <BankProvider>
        <AuthInitializer />
        <MarketplaceInitializer />
        <AppContent />
      </BankProvider>
  );
};

export default App;
