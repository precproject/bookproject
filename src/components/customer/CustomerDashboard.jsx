import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added
import { Package, Award, Loader2 } from 'lucide-react'; // Added Loader2
import { AuthContext } from '../../context/AuthContext';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer'; // Added
import OrdersTab from './OrdersTab';
import ReferralTab from './ReferralTab';
import { useTheme } from '../../context/ThemeContext';

export const CustomerDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(); // Initialize translation
  
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders');

  // Protect the route
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }

  // Improved Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t('dashboard.loading', 'Loading dashboard...')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-4 sm:p-6 pt-28 md:pt-32">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('dashboard.welcome', 'Welcome')}, {user.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('dashboard.subtitle', 'Manage your orders, track deliveries, and view your earnings.')}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-4 px-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'orders' 
                ? 'border-orange-600 text-orange-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Package size={20} /> {t('dashboard.myOrders', 'My Orders')}
          </button>
          
          <button 
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 pb-4 px-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'referrals' 
                ? 'border-orange-600 text-orange-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Award size={20} /> {t('dashboard.referralEarnings', 'Referral Earnings')}
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-8 min-h-[500px] mb-10 transition-colors">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'referrals' && <ReferralTab />}
          </div>
        </div>
      </main>

      <Footer />

      {/* Scoped CSS to hide scrollbar on mobile tab nav */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};