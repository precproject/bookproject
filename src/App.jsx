import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- CONTEXT PROVIDERS ---
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';

// --- GLOBAL COMPONENTS ---
import { AuthModal } from './components/auth/AuthModal';
import { ErrorPage } from './components/ui/ErrorPage';

// --- PUBLIC & CUSTOMER PAGES ---
import { HomeLayout } from './components/home/HomeLayout';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentStatus } from './pages/PaymentStatus';
import { CustomerDashboard } from './components/customer/CustomerDashboard';

// --- ADMIN PAGES ---
import { AdminLogin } from './components/dashboard/AdminLogin';
import { DashboardRoute } from './components/route/DashboardRoute';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { DashboardOrders } from './components/dashboard/DashboardOrders';
import { DashboardDelivery } from './components/dashboard/DashboardDelivery';
import { DashboardPayments } from './components/dashboard/DashboardPayments';
import { DashboardUsers } from './components/dashboard/DashboardUsers';
import { DashboardDiscounts } from './components/dashboard/DashboardDiscounts';
import { DashboardInventory } from './components/dashboard/DashboardInventory';
import { DashboardReferrals } from './components/dashboard/DashboardReferrals';
import { DashboardConfig } from './components/dashboard/DashboardConfig';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider> {/* <-- ADD THIS HERE */}
      {/* 1. STATE PROVIDERS (Wrapping the entire app) */}
      <AuthProvider>
        <CartProvider>
          <AdminProvider>
            
            {/* Global Auth Modal (Can be triggered from anywhere) */}
            <AuthModal />

            {/* 2. APPLICATION ROUTES */}
            <Routes>
              
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<HomeLayout />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-status/:orderId" element={<PaymentStatus />} />

              {/* --- CUSTOMER PROTECTED ROUTE --- */}
              {/* CustomerDashboard internally checks if user is logged in, else redirects */}
              <Route path="/dashboard" element={<CustomerDashboard />} />

              {/* --- ADMIN AUTH ROUTE --- */}
              <Route path="/login" element={<AdminLogin />} />

              {/* --- ADMIN DASHBOARD (Nested Routing) --- */}
              {/* DashboardRoute acts as the Layout Guard. It renders the Sidebar/Header, 
                  and the nested routes render inside its <Outlet /> */}
              <Route path="/admin" element={<DashboardRoute />}>
                <Route index element={<DashboardHome />} />
                <Route path="orders" element={<DashboardOrders />} />
                <Route path="delivery" element={<DashboardDelivery />} />
                <Route path="payments" element={<DashboardPayments />} />
                <Route path="users" element={<DashboardUsers />} />
                <Route path="discounts" element={<DashboardDiscounts />} />
                <Route path="inventory" element={<DashboardInventory />} />
                <Route path="referrals" element={<DashboardReferrals />} />
                <Route path="settings" element={<DashboardConfig />} />
              </Route>

              {/* --- 404 FALLBACK ROUTE --- */}
              <Route path="*" element={<ErrorPage />} />

            </Routes>

          </AdminProvider>
        </CartProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}