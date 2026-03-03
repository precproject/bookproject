import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, ShoppingCart, Truck, CreditCard, 
  Users, Tag, BookCopy, Share2, Settings, 
  Search, Menu, X, LogOut, ChevronDown,
  IceCream2,
  Pen
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext'; // Import your AuthContext

export const DashboardLayout = ({ children, activePath = '/admin' }) => {
  // --- CONSUME AUTH CONTEXT ---
  const { user, logout } = useContext(AuthContext);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Extract user details dynamically
  const userName = user?.name || 'System Admin';
  const userEmail = user?.email || 'admin@sahakarstree.com';
  const userInitial = userName.charAt(0).toUpperCase();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- SECURE LOGOUT HANDLER ---
  const handleLogout = () => {
    logout(); // This clears the global context and local storage token
    navigate('/login'); // Redirect to the admin login page
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Delivery', icon: Truck, path: '/admin/delivery' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Discounts', icon: Tag, path: '/admin/discounts' },
    { name: 'Inventory', icon: BookCopy, path: '/admin/inventory' },
    { name: 'Referrals', icon: Share2, path: '/admin/referrals' },
    { name: 'Blog', icon: Pen, path: '/admin/blog' },
    { name: 'Review', icon: IceCream2, path: '/admin/review' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-800">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 px-4 py-6 h-screen sticky top-0 shrink-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-10 text-emerald-800 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/admin')}>
          <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold">C</div>
          <span className="text-xl font-bold tracking-tight">SahakarStree</span>
        </div>

        <div className="text-xs font-bold text-slate-400 mb-4 px-2 tracking-wider uppercase">Menu</div>
        
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activePath === item.path || (activePath === '/' && item.path === '/admin');
            return (
              <button 
                key={item.name} 
                onClick={() => navigate(item.path)} 
                className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all ${isActive ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-400 mb-4 px-2 tracking-wider uppercase">System</div>
          <button onClick={() => navigate('/admin/settings')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all mb-2 ${activePath === '/admin/settings' ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Settings size={20} className={activePath === '/admin/settings' ? 'text-white' : 'text-slate-400'} />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-[#F8F9FA]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-emerald-700 transition-colors">
              <Menu size={20} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-full px-4 py-2.5 w-full max-w-md focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-sm">
              <Search size={18} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Search orders, users, or books..." className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400" />
              <div className="hidden lg:flex items-center justify-center bg-slate-100 rounded text-[10px] font-bold text-slate-500 px-1.5 py-0.5 ml-2">⌘K</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-full p-1 pr-4 cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
              >
                {/* Dynamic Avatar */}
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">
                  {userInitial}
                </div>
                {/* Dynamic Name & Email */}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-tight text-slate-800">{userName}</p>
                  <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">{userEmail}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 hidden sm:block transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-[scaleIn_0.15s_ease-out] origin-top-right z-50">
                  {/* Mobile-only User Info inside dropdown */}
                  <div className="px-4 py-3 border-b border-slate-100 mb-2 sm:hidden">
                    <p className="text-sm font-bold text-slate-800">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setIsProfileMenuOpen(false); navigate('/admin/settings'); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                  >
                    <Settings size={16} /> Account Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 mt-1 border-t border-slate-50 pt-3"
                  >
                    <LogOut size={16} /> Secure Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-24">
          {children}
        </div>
      </main>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Dark blurred background */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sliding Sidebar */}
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col px-4 py-6 animate-[slideRight_0.3s_ease-out]">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 px-2 mb-10 text-emerald-800 mt-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold">C</div>
              <span className="text-xl font-bold tracking-tight">SahakarStree</span>
            </div>

            <div className="text-xs font-bold text-slate-400 mb-4 px-2 tracking-wider uppercase">Menu</div>
            
            <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-2">
              {menuItems.map((item) => {
                const isActive = activePath === item.path || (activePath === '/' && item.path === '/admin');
                return (
                  <button 
                    key={item.name} 
                    onClick={() => { setIsMobileMenuOpen(false); navigate(item.path); }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all ${isActive ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              {/* Dynamic User info in mobile sidebar bottom */}
              <div className="flex items-center gap-3 px-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                  {userInitial}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-400 mb-4 px-2 tracking-wider uppercase">System</div>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate('/admin/settings'); }} 
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all mb-2 ${activePath === '/admin/settings' ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Settings size={20} className={activePath === '/admin/settings' ? 'text-white' : 'text-slate-400'} />
                <span className="font-medium text-sm">Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-3 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold"
              >
                <LogOut size={20} />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};