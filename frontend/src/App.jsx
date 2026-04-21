import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import SellerLoginPage from './pages/SellerLoginPage';
import SellerRegisterPage from './pages/SellerRegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SellerPendingPage from './pages/SellerPendingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const NO_NAVBAR = [
  '/login', '/login/seller', '/login/admin',
  '/register/customer', '/register/seller', '/seller/pending',
  '/dashboard', '/seller', '/admin',
];

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const hideNav = NO_NAVBAR.includes(pathname);
  return (
    <>
      {!hideNav && <Navbar />}
      {children}
    </>
  );
};

const PrivateRoute = ({ children, roles }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const SellerRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login/seller" replace />;
  if (user.role !== 'seller') return <Navigate to="/" replace />;
  if (user.sellerStatus !== 'approved') return <Navigate to="/seller/pending" replace />;
  return children;
};

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route path="/login" element={<CustomerLoginPage />} />
        <Route path="/register/customer" element={<CustomerRegisterPage />} />
        <Route path="/login/seller" element={<SellerLoginPage />} />
        <Route path="/register/seller" element={<SellerRegisterPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/seller/pending" element={<SellerPendingPage />} />

        <Route path="/cart" element={<PrivateRoute roles={['customer']}><CartPage /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute roles={['customer']}><CheckoutPage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute roles={['customer']}><OrdersPage /></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute roles={['customer', 'admin']}><OrderDetailPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute roles={['customer']}><CustomerDashboard /></PrivateRoute>} />

        <Route path="/seller" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
    <ToastContainer position="bottom-right" autoClose={3000} />
  </BrowserRouter>
);

export default App;
