import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Decorative large text in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-slate-100 pointer-events-none select-none z-0">
        404
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
          <AlertTriangle size={40} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-slate-500 max-w-md mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 active:scale-95"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};