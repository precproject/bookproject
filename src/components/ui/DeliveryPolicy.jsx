import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { useTranslation } from 'react-i18next';

export const DeliveryPolicy = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />
      <main className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('legal.delivery.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-6">{t('legal.lastUpdated')}</p>
          <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('legal.delivery.s1Title')}</h2>
              <p>{t('legal.delivery.s1Desc')}</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('legal.delivery.s2Title')}</h2>
              <p>{t('legal.delivery.s2Desc')}</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('legal.delivery.s3Title')}</h2>
              <p>{t('legal.delivery.s3Desc')}</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('legal.delivery.s4Title')}</h2>
              <p>{t('legal.delivery.s4Desc')}</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('legal.delivery.s5Title')}</h2>
              <p className="font-medium text-orange-600 dark:text-orange-500">{t('legal.delivery.s5Desc')}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};