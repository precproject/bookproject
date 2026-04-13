import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Users, Package, Clock, TrendingUp, CheckCircle, BellRing, ChevronRight, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { adminService } from '../../api/service/adminService';

export const DashboardHome = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // NEW: Prevent spam-clicking the reminder button
  const [sendingReminderId, setSendingReminderId] = useState(null); 

  // Live Data States
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, activeDeliveries: 0, totalUsers: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [last24hData, setLast24hData] = useState([]);
  const [recentPurchasers, setRecentPurchasers] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    fetchLiveDashboardData();
  }, []);

  const fetchLiveDashboardData = async () => {
    try {
      const [dashboardData, recentOrdersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getOrdersPaginated({ limit: 100 }) 
      ]);

      if (dashboardData) {
        setStats({
          revenue: dashboardData.stats?.totalEarnings || 0,
          totalOrders: dashboardData.stats?.totalOrders || 0,
          activeDeliveries: dashboardData.stats?.inProgressDeliveries || 0,
          totalUsers: dashboardData.stats?.totalUsers || 0
        });

        setRecentPurchasers((dashboardData.recentPurchasers || []).map(p => ({
          id: p._id,
          name: p.user?.name || 'Guest Customer',
          initial: (p.user?.name || 'G').charAt(0).toUpperCase(),
          time: new Date(p.createdAt).toLocaleDateString(),
          status: p.status === 'Success' ? 'Paid' : p.status
        })));

        setPendingPayments((dashboardData.pendingPayments || []).map(p => ({
          id: p.orderId,
          amount: p.priceBreakup?.total || 0,
          user: p.user?.email || 'Unknown Email'
        })));
      }

      let statusCounts = { 'Success': 0, 'Pending Order': 0, 'Pending Payment': 0 };
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

      if (recentOrdersData && recentOrdersData.orders) {
        recentOrdersData.orders.forEach(order => {
          const orderDay = days[new Date(order.createdAt).getDay()];
          weekCounts[orderDay] += 1;

          if (order.status === 'Delivered' || order.status === 'Success') statusCounts['Success'] += 1;
          if (order.status === 'In Progress') statusCounts['Pending Order'] += 1;
          if (order.status === 'Pending Payment') statusCounts['Pending Payment'] += 1;
        });
      }

      setWeeklyData([
        { name: 'Mon', orders: weekCounts['Mon'] }, { name: 'Tue', orders: weekCounts['Tue'] },
        { name: 'Wed', orders: weekCounts['Wed'] }, { name: 'Thu', orders: weekCounts['Thu'] },
        { name: 'Fri', orders: weekCounts['Fri'] }, { name: 'Sat', orders: weekCounts['Sat'] },
        { name: 'Sun', orders: weekCounts['Sun'] }
      ]);

      // OPTIMIZATION: Removed the falsified `|| 1` so the chart only shows real data
      const chartData = [
        { name: 'Success', value: statusCounts['Success'], color: '#1B5E20' }, 
        { name: 'In Progress', value: statusCounts['Pending Order'], color: '#6EE7B7' }, 
        { name: 'Pending Payment', value: statusCounts['Pending Payment'], color: '#FCD34D' }
      ].filter(item => item.value > 0);
      
      setLast24hData(chartData);

    } catch (error) {
      console.error("Trouble fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // OPTIMIZATION: Added async state to prevent multiple emails firing
  const handleNotify = async (orderId, email) => {
    setSendingReminderId(orderId);
    try {
      // NOTE: Replace this timeout with your actual API call when ready
      // await apiClient.post(`/admin/orders/${orderId}/remind`);
      await new Promise(res => setTimeout(res, 800)); // Simulated delay
      
      setToastMessage(`Payment reminder sent to ${email}`);
    } catch (error) {
      setToastMessage(`Failed to send reminder to ${email}`);
    } finally {
      setSendingReminderId(null);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-slate-500">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
        <p>Gathering your store's live records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Plan, track, and manage your book orders with ease.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-emerald-800 p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm font-medium text-emerald-100">Total Earnings</span>
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm"><TrendingUp size={16} /></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div onClick={() => navigate('/admin/orders')} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Total Orders</span>
            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Package size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalOrders.toLocaleString()}</h3>
          </div>
        </div>

        <div onClick={() => navigate('/admin/users')} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Total Customers</span>
            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Users size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalUsers.toLocaleString()}</h3>
          </div>
        </div>

        <div onClick={() => navigate('/admin/delivery')} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Active Deliveries</span>
            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Clock size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.activeDeliveries.toLocaleString()}</h3>
            {stats.activeDeliveries > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-orange-500">
                <ArrowDownRight size={12} /> Needs packing
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Weekly Orders Overview</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <Tooltip cursor={{fill: '#f1f5f9', radius: 8}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', color: '#1e293b'}} />
                <Bar dataKey="orders" radius={[6, 6, 6, 6]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.orders > 0 ? '#1B5E20' : '#A7F3D0'} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-2">Order Status Trends</h3>
          <p className="text-xs text-slate-500 mb-4">Based on latest 100 orders</p>
          
          <div className="flex-1 min-h-[180px] relative">
            {last24hData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={last24hData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {last24hData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} itemStyle={{color: '#1e293b'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400">
                No data available
              </div>
            )}
            
            {last24hData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800">
                  {last24hData.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
              </div>
            )}
          </div>
          
          {last24hData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-medium text-slate-600">
              {last24hData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Recent Purchasers</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {recentPurchasers.length > 0 ? recentPurchasers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    {user.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-500">Order Placed • {user.time}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Paid</span>
              </div>
            )) : (
               <div className="text-center text-slate-400 py-10 text-sm font-medium">No recent purchases found.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Action Required</h3>
            <button onClick={() => navigate('/admin/payments')} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-1">
              Manage <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-3 p-4 rounded-2xl border border-yellow-100 bg-yellow-50/50 hover:bg-yellow-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                     <p className="text-sm font-bold text-slate-800">Order #{payment.id}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">₹{payment.amount}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                   <p className="text-xs text-slate-500 font-medium">{payment.user}</p>
                   <button 
                    onClick={() => handleNotify(payment.id, payment.user)}
                    disabled={sendingReminderId === payment.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 hover:text-emerald-800 transition-colors active:scale-95 disabled:opacity-50"
                   >
                     {sendingReminderId === payment.id ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />} 
                     {sendingReminderId === payment.id ? 'Sending...' : 'Send Reminder'}
                   </button>
                </div>
              </div>
            ))}
            {pendingPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <CheckCircle size={32} className="mb-2 text-emerald-200" />
                <p className="text-sm font-medium">All payments are up to date!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};