import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Users, Package, Clock, TrendingUp, CheckCircle, BellRing, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// --- MOCK DATA ---
const weeklyData = [
  { name: 'Mon', orders: 45 }, { name: 'Tue', orders: 52 },
  { name: 'Wed', orders: 38 }, { name: 'Thu', orders: 65 },
  { name: 'Fri', orders: 48 }, { name: 'Sat', orders: 80 },
  { name: 'Sun', orders: 70 },
];

const last24hData = [
  { name: 'Success', value: 45, color: '#1B5E20' }, // Dark Emerald
  { name: 'Pending Order', value: 25, color: '#6EE7B7' }, // Light Emerald
  { name: 'Pending Payment', value: 15, color: '#FCD34D' }, // Yellow
];

const recentPurchasers = [
  { id: 1, name: 'Rahul Patil', initial: 'R', time: '15 mins ago', status: 'Paid' },
  { id: 2, name: 'Sneha Deshmukh', initial: 'S', time: '30 mins ago', status: 'Paid' },
  { id: 3, name: 'Amit Kulkarni', initial: 'A', time: '45 mins ago', status: 'Paid' },
];

const pendingPayments = [
  { id: 'BK-8051', amount: 400, user: 'vikram.t@email.com' },
  { id: 'BK-8052', amount: 800, user: 'pooja.k@email.com' },
];

export const DashboardHome = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  // --- ACTION HANDLERS ---
  const handleNotify = (email) => {
    setToastMessage(`Payment reminder sent to ${email}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-[slideLeft_0.3s_ease-out]">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Plan, track, and manage your book orders with ease.</p>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Earnings */}
        <div className="bg-emerald-800 p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm font-medium text-emerald-100">Total Earnings</span>
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm"><TrendingUp size={16} /></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold">₹1,24,500</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-200 bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
              <ArrowUpRight size={12} /> 12% from last month
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div 
          onClick={() => navigate('/admin/orders')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Total Orders</span>
            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Package size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">1,432</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={12} /> 8% from last month
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Total Users</span>
            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Users size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">2,845</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={12} /> 15% from last month
            </div>
          </div>
        </div>

        {/* In Progress Deliveries */}
        <div 
          onClick={() => navigate('/admin/delivery')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Active Deliveries</span>
            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Clock size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">48</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-500">
              <ArrowDownRight size={12} /> 2 pending dispatch
            </div>
          </div>
        </div>
      </div>

      {/* --- VISUALIZATION ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Daily Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Daily Orders Overview</h3>
            <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9', radius: 8}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', color: '#1e293b'}} 
                />
                <Bar dataKey="orders" radius={[6, 6, 6, 6]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.orders > 70 ? '#1B5E20' : '#A7F3D0'} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Last 24 Hours Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-2">Last 24h Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Total 85 orders processed</p>
          
          <div className="flex-1 min-h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={last24hData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {last24hData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                  itemStyle={{color: '#1e293b'}}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">85</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Orders</span>
            </div>
          </div>
          
          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-medium text-slate-600">
            {last24hData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RECENT LISTS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Purchases List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Recent Purchasers</h3>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {recentPurchasers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    {user.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-500">Purchased Hardcopy • {user.time}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Paid</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments Alert List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Action Required</h3>
            <button 
              onClick={() => navigate('/admin/payments')}
              className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
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
                    onClick={() => handleNotify(payment.user)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 hover:text-emerald-800 transition-colors active:scale-95"
                   >
                     <BellRing size={14} /> Send Reminder
                   </button>
                </div>
              </div>
            ))}
            {/* Empty State visual if no pending payments */}
            {pendingPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
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