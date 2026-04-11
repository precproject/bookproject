import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- CONTEXT PROVIDERS (Must be synchronous) ---
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';

// --- GLOBAL COMPONENTS & CRITICAL ROUTES ---
// We keep HomeLayout synchronous so the landing page loads instantly (Better LCP / SEO score)
import { AuthModal } from './components/auth/AuthModal';
import { HomeLayout } from './components/home/HomeLayout';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { ConfigProvider } from './context/ConfigContext';
import { DashboardReviews } from './components/dashboard/DashboardReviews';
import { DeliveryPolicy } from './components/ui/DeliveryPolicy';

// ============================================================================
// LAZY LOADED COMPONENTS (Code Splitting)
// These only load when the user navigates to their specific route.
// We use `.then(m => ({ default: m.ComponentName }))` to support your Named Exports.
// ============================================================================

// --- PUBLIC & CUSTOMER PAGES ---
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus').then(m => ({ default: m.PaymentStatus })));
const CustomerDashboard = lazy(() => import('./components/customer/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const StorePage = lazy(() => import('./pages/StorePage').then(m => ({ default: m.StorePage })));
const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogArticle = lazy(() => import('./pages/BlogArticle').then(m => ({ default: m.BlogArticle })));
const PrivacyPolicy = lazy(() => import('./components/ui/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazy(() => import('./components/ui/RefundPolicy').then(m => ({ default: m.RefundPolicy })));
const TermsOfService = lazy(() => import('./components/ui/TermsOfService').then(m => ({ default: m.TermsOfService })));
const ErrorPage = lazy(() => import('./components/ui/ErrorPage').then(m => ({ default: m.ErrorPage })));

// --- ADMIN PAGES ---
const AdminLogin = lazy(() => import('./components/dashboard/AdminLogin').then(m => ({ default: m.AdminLogin })));
const DashboardRoute = lazy(() => import('./components/route/DashboardRoute').then(m => ({ default: m.DashboardRoute })));
const DashboardHome = lazy(() => import('./components/dashboard/DashboardHome').then(m => ({ default: m.DashboardHome })));
const DashboardOrders = lazy(() => import('./components/dashboard/DashboardOrders').then(m => ({ default: m.DashboardOrders })));
const DashboardDelivery = lazy(() => import('./components/dashboard/DashboardDelivery').then(m => ({ default: m.DashboardDelivery })));
const DashboardPayments = lazy(() => import('./components/dashboard/DashboardPayments').then(m => ({ default: m.DashboardPayments })));
const DashboardUsers = lazy(() => import('./components/dashboard/DashboardUsers').then(m => ({ default: m.DashboardUsers })));
const DashboardDiscounts = lazy(() => import('./components/dashboard/DashboardDiscounts').then(m => ({ default: m.DashboardDiscounts })));
const DashboardInventory = lazy(() => import('./components/dashboard/DashboardInventory').then(m => ({ default: m.DashboardInventory })));
const DashboardReferrals = lazy(() => import('./components/dashboard/DashboardReferrals').then(m => ({ default: m.DashboardReferrals })));
const DashboardConfig = lazy(() => import('./components/dashboard/DashboardConfig').then(m => ({ default: m.DashboardConfig })));
const DashboardBlogs = lazy(() => import('./components/dashboard/DashboardBlogs').then(m => ({ default: m.DashboardBlogs })));


// --- LOADING FALLBACK ---
// A sleek, theme-aware spinner that shows while a lazy chunk is downloading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <ConfigProvider> {/* <--- 2. WRAP IT AROUND AUTH & CART */}
        <AuthProvider>
          <CartProvider>
            <AdminProvider>
              
              <AuthModal />

              {/* Suspense Boundary catches all lazy loaded routes */}
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  
                  {/* --- PUBLIC ROUTES --- */}
                  <Route path="/" element={<HomeLayout />} /> {/* Sync loading for instant FCP */}
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment-status/:orderId" element={<PaymentStatus />} />
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/store/book/:id" element={<ProductPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogArticle />} />

                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/delivery-policy" element={<DeliveryPolicy />} />

                  {/* --- CUSTOMER PROTECTED ROUTE --- */}
                  <Route path="/dashboard" element={<CustomerDashboard />} />

                  {/* --- ADMIN AUTH ROUTE --- */}
                  <Route path="/login" element={<AdminLogin />} />

                  {/* --- ADMIN DASHBOARD (Nested Routing) --- */}
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
                    <Route path="blog" element={<DashboardBlogs />} />
                    <Route path="review" element={<DashboardReviews />} />
                  </Route>

                  {/* --- 404 FALLBACK ROUTE --- */}
                  <Route path="*" element={<ErrorPage />} />

                </Routes>
              </Suspense>

            </AdminProvider>
          </CartProvider>
        </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}