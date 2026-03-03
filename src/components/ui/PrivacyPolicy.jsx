import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';

export const PrivacyPolicy = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />
      
      <main className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-6">Last Updated: March 2026</p>

          <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Information We Collect</h2>
              <p>When you visit SahakarStree, register for an account, or make a purchase, we may collect personal information including your name, email address, phone number, shipping address, and payment details. We also collect non-personal data such as browser type, IP address, and pages visited to improve our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To process and fulfill your book orders.</li>
                <li>To communicate with you regarding order updates, shipping, and support.</li>
                <li>To send periodic newsletters or promotional offers (only if you have opted in).</li>
                <li>To improve our website functionality and user experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Data Protection & Security</h2>
              <p>We implement strict security measures to protect your personal information. Payment processing is handled by secure, PCI-compliant third-party gateways (e.g., Razorpay, PhonePe). We do not store your credit card or UPI details on our servers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Cookies</h2>
              <p>SahakarStree uses cookies to remember your cart items, keep you logged in, and analyze site traffic. You can choose to disable cookies through your browser settings, though some features of the site may not function properly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@sahakarstree.in" className="text-orange-600 hover:underline">privacy@sahakarstree.in</a>.</p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};