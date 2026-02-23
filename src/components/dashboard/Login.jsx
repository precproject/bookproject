import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, BookOpen, ArrowRight, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('admin@chintamukti.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Temporary Admin Bypass: Checks if password is empty/null
    if (email === 'admin@chintamukti.com' && password === '') {
      navigate('/admin');
    } else {
      setError('Invalid credentials. (Hint: Leave password blank for admin access)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-96 bg-emerald-900 rounded-b-[4rem] md:rounded-b-[8rem] z-0"></div>
      
      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-800 shadow-xl mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Chintamukti.</h1>
          <p className="text-emerald-200 mt-2 text-sm">Dashboard Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Welcome Back</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank for temp access"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-800 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md mt-4 group"
            >
              Secure Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-medium text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} Chintamukti Publications. Secure Portal.
        </p>
      </div>
    </div>
  );
};