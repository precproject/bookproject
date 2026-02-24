import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import OrdersTab from '../components/customer/OrdersTab';
import ReferralTab from '../components/customer/ReferralTab';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-8">
        <button 
          className={`pb-3 font-semibold text-lg ${activeTab === 'orders' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
        {user.referralCode && (
          <button 
            className={`pb-3 font-semibold text-lg ${activeTab === 'referrals' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('referrals')}
          >
            Referral Earnings
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'referrals' && <ReferralTab />}
      </div>
    </div>
  );
};

export default CustomerDashboard;