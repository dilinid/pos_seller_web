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
import Profile from './pages/Profile';
import SellerDashboard from './pages/SellerDashboard';
import SellerSettings from './pages/SellerSettings';
import SellerProducts from './pages/SellerProducts';
import SellerStock from './pages/SellerStock';
import SellerOrders from './pages/SellerOrders';
import SellerPickupList from './pages/SellerPickupList';
import SellerPackingList from './pages/SellerPackingList';
import SellerPromotions from './pages/SellerPromotions';
import SellerPayments from './pages/SellerPayments';
import SellerAddProduct from './pages/SellerAddProduct';
import SellerStorefront from './pages/SellerStorefront';
import POSSync from './pages/POSSync';
import { SellerLayout } from './components/seller/SellerLayout';
import { useAuthStore } from './stores/auth.store';
import { useSellerStore } from './stores/seller.store';
import { AuthInitializer } from './components/AuthInitializer';

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

// Seller-only route guard — user must be authenticated AND an approved seller
const SellerOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.userSession?.userRole);
  const isSeller = useSellerStore((s) => (user ? s.isSeller(user.id, userRole) : false));
  if (!user) return <Navigate to="/login" replace />;
  if (!isSeller) return <Navigate to="/" replace />;
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

        {/* Seller Storefront */}
        <Route path="/store/:sellerId" element={<SellerStorefront />} />

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
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Seller Portal Routes */}
        <Route path="/seller/login" element={<Navigate to="/" replace />} />
        <Route
          path="/seller"
          element={
            <SellerOnlyRoute>
              <SellerLayout />
            </SellerOnlyRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="pos-sync" element={<POSSync />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="stock" element={<SellerStock />} />
          <Route path="products/add" element={<SellerAddProduct />} />
          <Route path="products/edit/:draftId" element={<SellerAddProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="pickup-list" element={<SellerPickupList />} />
          <Route path="packing-list" element={<SellerPackingList />} />
          <Route path="promotions" element={<SellerPromotions />} />
          <Route path="payments" element={<SellerPayments />} />
          <Route path="settings" element={<SellerSettings />} />
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
        <AppContent />
      </BankProvider>
  );
};

export default App;
