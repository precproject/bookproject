import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Award } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Navbar } from '../sections/Navbar';
import OrdersTab from './OrdersTab';
import ReferralTab from './ReferralTab';
import { useTheme } from '../../context/ThemeContext';

export const CustomerDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders');

  // Protect the route
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar theme={theme} setTheme={toggleTheme} />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 pt-40 md:pt-32">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome, {user.name}</h1>
            <p className="text-slate-500 mt-1">Manage your orders, track deliveries, and view your earnings.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-4 px-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'orders' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package size={20} /> My Orders
          </button>
          
          <button 
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 pb-4 px-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'referrals' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award size={20} /> Referral Earnings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-8 min-h-[500px]">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'referrals' && <ReferralTab />}
        </div>
      </div>
    </div>
  );
};