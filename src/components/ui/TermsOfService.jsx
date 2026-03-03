import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';

export const TermsOfService = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />
      
      <main className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-6">Last Updated: March 2026</p>

          <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Agreement to Terms</h2>
              <p>By accessing or using SahakarStree, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the website or use any services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Intellectual Property</h2>
              <p>All content, including text, graphics, logos, book excerpts, and images on this site, is the property of SahakarStree and its authors, protected by Indian and international copyright laws. Unauthorized reproduction or distribution is strictly prohibited.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. User Accounts</h2>
              <p>If you create an account on the site, you are responsible for maintaining the security of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Pricing and Availability</h2>
              <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We shall not be liable to you or any third party for any modification, price change, or discontinuance.</p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};