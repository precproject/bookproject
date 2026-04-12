import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next'; // <-- CRITICAL: Added translation hook
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';
import { Share2, IndianRupee, Clock, CheckCircle } from 'lucide-react';

const ReferralTab = () => {
  const { t, i18n } = useTranslation(); // <-- Initialize translation
  const { user } = useContext(AuthContext);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const { data } = await apiClient.get(ENDPOINTS.MY_REFERRAL);
        if (data && data.code) setReferralData(data);
      } catch (error) {
        console.error('Failed to fetch referral data');
      } finally {
        setLoading(false);
      }
    };
    fetchReferral();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">{t('dashboard.referrals.loading', 'Loading referral stats...')}</div>;
  
  if (!referralData) {
    return (
      <div className="text-center py-16">
        <Share2 size={60} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-700 mb-2">{t('dashboard.referrals.noActive', 'No Active Referrals')}</h3>
        <p className="text-slate-500">{t('dashboard.referrals.notEnrolled', 'You are not currently enrolled in our referral program.')}</p>
      </div>
    );
  }

  const totalPaid = referralData.totalEarned - referralData.pendingPayout;
  const referralLink = `${window.location.origin}/?ref=${referralData.code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert(t('dashboard.referrals.copiedAlert', 'Referral link copied to clipboard!'));
  };

  // Determine locale for dates
  const dateLocale = i18n.language === 'mr' ? 'mr-IN' : 'en-IN';

  return (
    <div>
      {/* Code Display */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10"><Share2 size={120} /></div>
        <h2 className="text-green-800 font-bold mb-2">{t('dashboard.referrals.yourLinkTitle', 'Your Unique Referral Link')}</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <code className="bg-white px-6 py-3 rounded-xl text-lg sm:text-xl font-black text-green-700 tracking-wider shadow-sm border border-green-100 select-all">
            {referralLink}
          </code>
          <button onClick={copyToClipboard} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-sm z-10 relative">
            {t('dashboard.referrals.copyLink', 'Copy Link')}
          </button>
        </div>
        <p className="text-sm font-medium text-green-600 mt-4">
          {t('dashboard.referrals.shareEarn', 'Share this link to earn ₹{{rate}} per successful book sale!', { rate: referralData.rewardRate })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3"><IndianRupee size={24}/></div>
          <p className="text-slate-500 font-medium mb-1">{t('dashboard.referrals.totalEarned', 'Total Earned')}</p>
          <p className="text-3xl font-black text-slate-800">₹{referralData.totalEarned}</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3"><Clock size={24}/></div>
          <p className="text-orange-700 font-medium mb-1">{t('dashboard.referrals.pendingPayout', 'Pending Payout')}</p>
          <p className="text-3xl font-black text-orange-800">₹{referralData.pendingPayout}</p>
        </div>

        <div className="bg-green-50 border border-green-100 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle size={24}/></div>
          <p className="text-green-700 font-medium mb-1">{t('dashboard.referrals.successfullyPaid', 'Successfully Paid')}</p>
          <p className="text-3xl font-black text-green-800">₹{totalPaid}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2">
        {t('dashboard.referrals.successfulReferrals', 'Successful Referrals')} <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">{referralData.transactions?.length || 0}</span>
      </h3>
      
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.referrals.tableDate', 'Date')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.referrals.tableOrderId', 'Order ID')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.referrals.tableOrderTotal', 'Order Total')}</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.referrals.tableCommission', 'Your Commission')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referralData.transactions?.map((txn) => (
                <tr key={txn._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(txn.createdAt).toLocaleDateString(dateLocale)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{txn.orderId || txn.order?.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">₹{txn.priceBreakup?.total || txn.order?.priceBreakup?.total || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-black text-right">+₹{referralData.rewardRate}</td>
                </tr>
              ))}
              {(!referralData.transactions || referralData.transactions.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    {t('dashboard.referrals.noReferralsYet', 'No successful referrals yet. Share your link to get started!')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralTab;