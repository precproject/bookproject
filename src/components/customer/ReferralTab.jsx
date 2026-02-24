import React, { useEffect, useState, useContext } from 'react';
import apiClient from '../../api/client';
import { AuthContext } from '../../context/AuthContext';

const ReferralTab = () => {
  const { user } = useContext(AuthContext);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const { data } = await apiClient.get('/auth/my-referral');
        if (data && data.code) setReferralData(data);
      } catch (error) {
        console.error('Failed to fetch referral data');
      } finally {
        setLoading(false);
      }
    };
    fetchReferral();
  }, []);

  if (loading) return <div>Loading referral stats...</div>;
  if (!referralData) return <div>You are not currently enrolled in the referral program.</div>;

  const totalPaid = referralData.totalEarned - referralData.pendingPayout;

  return (
    <div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
        <h2 className="text-gray-600 font-medium mb-2">Your Unique Referral Code</h2>
        <div className="text-3xl font-black text-green-700 tracking-wider">
          {referralData.code}
        </div>
        <p className="text-sm text-green-600 mt-2">Share this code to earn ₹{referralData.rewardRate} per successful sale!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border p-5 rounded-lg text-center shadow-sm">
          <p className="text-gray-500 mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-gray-800">₹{referralData.totalEarned}</p>
        </div>
        <div className="border p-5 rounded-lg text-center shadow-sm border-orange-200 bg-orange-50">
          <p className="text-orange-600 mb-1">Pending Payout</p>
          <p className="text-2xl font-bold text-orange-700">₹{referralData.pendingPayout}</p>
        </div>
        <div className="border p-5 rounded-lg text-center shadow-sm border-green-200 bg-green-50">
          <p className="text-green-600 mb-1">Successfully Paid</p>
          <p className="text-2xl font-bold text-green-700">₹{totalPaid}</p>
        </div>
      </div>

      {/* Transactions List */}
      <h3 className="font-bold text-lg mb-4 text-gray-800">Successful Referrals ({referralData.transactions?.length || 0})</h3>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Your Commission</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {referralData.transactions?.map((txn) => (
              <tr key={txn._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{txn.orderId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{txn.priceBreakup?.total || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold text-right">+₹{referralData.rewardRate}</td>
              </tr>
            ))}
            {(!referralData.transactions || referralData.transactions.length === 0) && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No successful referrals yet. Start sharing your code!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralTab;