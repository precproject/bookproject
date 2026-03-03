import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';

export const RefundPolicy = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />
      
      <main className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">Refund & Cancellation Policy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-6">Last Updated: March 2026</p>

          <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Physical Book Returns</h2>
              <p>We accept returns for physical books within <strong>7 days</strong> of delivery, provided the book is unused, undamaged, and in its original packaging. If you receive a damaged or misprinted copy, please contact us immediately with photographic proof for a free replacement.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Digital Products (E-Books)</h2>
              <p>Due to the nature of digital goods, all sales of E-Books and downloadable materials are <strong>final and non-refundable</strong> once the download link has been generated or accessed.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Refund Processing</h2>
              <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Order Cancellations</h2>
              <p>You may cancel an order for physical goods before it has been dispatched. Once an order is handed over to our courier partners, it cannot be canceled, but you may initiate a return upon delivery.</p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};