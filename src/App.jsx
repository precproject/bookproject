import React from 'react';
import { HomeLayout } from './components/home/HomeLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { DashboardRoute } from './components/route/DashboardRoute';
import { DashboardOrders } from './components/dashboard/DashboardOrders';
import { DashboardDelivery } from './components/dashboard/DashboardDelivery';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { DashboardPayments } from './components/dashboard/DashboardPayments';
import { DashboardUsers } from './components/dashboard/DashboardUsers';
import { DashboardDiscounts } from './components/dashboard/DashboardDiscounts';
import { DashboardInventory } from './components/dashboard/DashboardInventory';
import { DashboardReferrals } from './components/dashboard/DashboardReferrals';
import { DashboardConfig } from './components/dashboard/DashboardConfig';
import { ErrorPage } from './components/ui/ErrorPage';
import { Login } from './components/dashboard/Login';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentStatus } from './pages/PaymentStatus';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <BrowserRouter>
      {/* 2. WRAP EVERYTHING INSIDE THE AUTH PROVIDER */}
      <AuthProvider>
      <CartProvider>

      <AuthModal />

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<HomeLayout />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" element={ user ? <CustomerDashboard /> : <Navigate to="/" /> } />
        {/* <Route path="/cart" element={<CartPage />} /> */}

        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-status/:orderId" element={<PaymentStatus />} />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <DashboardRoute>
              <DashboardHome />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <DashboardRoute>
              <DashboardOrders />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/delivery"
          element={
            <DashboardRoute>
              <DashboardDelivery />
            </DashboardRoute>
          }
        />
        <Route path="/admin/payments" element={<DashboardRoute><DashboardPayments /></DashboardRoute>} />
        <Route path="/admin/users" element={<DashboardRoute><DashboardUsers /></DashboardRoute>} />
        <Route path="/admin/discounts" element={<DashboardRoute><DashboardDiscounts /></DashboardRoute>} />
        <Route path="/admin/inventory" element={<DashboardRoute><DashboardInventory /></DashboardRoute>} />
        <Route path="/admin/referrals" element={<DashboardRoute><DashboardReferrals /></DashboardRoute>} />
        <Route path="/admin/settings" element={<DashboardRoute><DashboardConfig /></DashboardRoute>} />

        {/* Fallback */}
        {/*
        <Route path="*" element={<Navigate to="/" replace />} />
        */}
        <Route path="*" element={<ErrorPage />} />

      </Routes>

      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}