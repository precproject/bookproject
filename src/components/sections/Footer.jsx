import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { 
  BookOpen, Facebook, Twitter, Instagram, Linkedin, 
  MapPin, Phone, Mail, ArrowRight, Youtube
} from 'lucide-react';
import apiClient from '../../api/client';

// Pass 't' function as a prop to isolate translations
const PaymentBadges = ({ t }) => (
  <div className="flex flex-wrap items-center gap-3">
    {/* Visa */}
    <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center h-8 w-12 shadow-sm transition-transform hover:scale-105 overflow-hidden">
      <img src="https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/01e4b9ae-5bd1-4d36-b19a-647d36eff900/w=420,sharpen=1" alt="Visa" className="h-full w-full object-contain p-1"/>
    </div>
    {/* Mastercard */}
    <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center h-8 w-12 shadow-sm relative overflow-hidden transition-transform hover:scale-105">
      <img src="https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/0dad6858-9c10-40d1-7258-0b606f111e00/w=320,sharpen=1" alt="Mastercard" className="h-full w-full object-contain p-1.5"/>
    </div>
    {/* RuPay */}
    <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center h-8 w-14 shadow-sm relative overflow-hidden transition-transform hover:scale-105">
      <img src="https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/eea0da37-b667-4d93-3e73-ce63b3b81400/public" alt="RuPay" className="h-full w-full object-contain p-1"/>
    </div>
    {/* UPI */}
    <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center h-8 w-12 shadow-sm relative overflow-hidden transition-transform hover:scale-105">
       <img src="https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/8c07a3ee-6954-4b35-f511-ae9011dbfd00/w=320,sharpen=1" alt="UPI" className="h-full w-full object-contain p-1.5"/>
    </div>
    <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 ml-1 tracking-tight">
      {t('footer.andMore')}
    </span>
  </div>
);

export const Footer = () => {
  const { t } = useTranslation(); 
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const response = await apiClient.get('/blogs', { params: { limit: 3 } });
        setRecentBlogs(response.data.blogs || []);
      } catch (error) {
        console.error("Failed to load footer blogs", error);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchRecentBlogs();
  }, []);

  const exploreLinks = [
    { name: t('footer.exploreLinks.store'), path: '/store' },
    { name: t('footer.exploreLinks.blog'), path: '/blog' },
    { name: t('footer.exploreLinks.aboutAuthor'), path: '/#author' },
    { name: t('footer.exploreLinks.trackOrder'), path: '/dashboard' }
  ];

  return (
    <footer className="bg-slate-50 dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800/60 pt-20 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-8">
        
        {/* =========================================
            TOP SECTION: 3-COLUMN CREATIVE LAYOUT
        ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-12 mb-14">
          
          {/* Column 1: About */}
          <div className="lg:pr-8 flex flex-col h-full">
            <h4 className="font-bold text-slate-900 dark:text-white mb-5 text-lg tracking-tight">
              {t('footer.aboutUs')}
            </h4>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed flex-grow max-w-sm font-medium tracking-normal">
              {t('footer.aboutDesc')}
            </p>
          </div>
          
          {/* Column 2: Explore Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-5 text-lg tracking-tight">
              {t('footer.explore')}
            </h4>
            <ul className="space-y-3.5">
              {exploreLinks.map(link => (
                <li key={link.name}>
                  {link.path.startsWith('/#') ? (
                    <a href={link.path} className="text-[15px] font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all inline-block hover:translate-x-1 duration-300 tracking-normal">
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.path} className="text-[15px] font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all inline-block hover:translate-x-1 duration-300 tracking-normal">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Stacked Recent Articles & Contact Info */}
          <div className="flex flex-col gap-10">
            
            {/* 3A: Dynamic Blog Section */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-5 text-lg tracking-tight">
                {t('footer.recentArticles')}
              </h4>
              <div className="space-y-4">
                {loadingBlogs ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  </div>
                ) : recentBlogs.length > 0 ? (
                  recentBlogs.map(blog => (
                    <Link key={blog._id} to={`/blog/${blog.slug}`} className="group block">
                      <h5 className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug tracking-normal">
                        {blog.title}
                      </h5>
                      <span className="text-[12px] font-bold text-orange-600/80 dark:text-orange-500/80 mt-1.5 flex items-center gap-1 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors tracking-tight">
                        {t('footer.readArticle')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 tracking-normal">
                    {t('footer.noArticles')}
                  </p>
                )}
              </div>
            </div>

            {/* 3B: Contact Information & Socials */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-5 text-lg tracking-tight">
                {t('footer.getInTouch')}
              </h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-[15px] font-medium text-slate-600 dark:text-slate-400 tracking-normal">
                  <Mail size={18} className="text-slate-400 dark:text-slate-500" />
                  <a href="mailto:hello@sahakarstree.in" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">hello@sahakarstree.in</a>
                </li>
                <li className="flex items-center gap-3 text-[15px] font-medium text-slate-600 dark:text-slate-400 tracking-normal">
                  <Phone size={18} className="text-slate-400 dark:text-slate-500" />
                  <a href="tel:+919876543210" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">+91 98765 43210</a>
                </li>
              </ul>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {[
                  { icon: Linkedin, url: '#' },
                  { icon: Facebook, url: '#' },
                  { icon: Instagram, url: '#' },
                  { icon: Twitter, url: '#' },
                  { icon: Youtube, url: '#' }
                ].map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-500 dark:hover:border-orange-500 hover:border-orange-600 transition-all transform hover:-translate-y-1 shadow-sm"
                  >
                    <social.icon size={18} strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>
        
        {/* --- MIDDLE DIVIDER --- */}
        <div className="w-full h-px bg-slate-200 dark:bg-slate-800/60 mb-8 md:mb-10"></div>

        {/* =========================================
            BOTTOM SECTION: BRAND, PAYMENTS & LEGAL
        ========================================= */}
        
        {/* Translated Logo Anchored at the Bottom Left */}
        <div className="mb-6 md:mb-8 flex justify-center md:justify-start">
          <Link to="/" className="text-2xl md:text-3xl font-serif font-black flex items-center gap-2.5 text-slate-900 dark:text-white hover:opacity-90 transition-opacity w-fit tracking-tight">
            <BookOpen className="text-orange-600 dark:text-orange-500" size={28} strokeWidth={2.5} />
            <span>
              {t('footer.brandPart1', 'Sahakar')}<span className="text-orange-600 dark:text-orange-500">{t('footer.brandPart2', 'Stree')}</span>
            </span>
          </Link>
        </div>

        {/* Row: Payments & Legal Links */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8 mb-8 md:mb-10">
          
          <PaymentBadges t={t} />

          {/* Legal Links clustered in the center/right */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[14px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            <Link to="/privacy-policy" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t('footer.privacyPolicy')}</Link>
            <Link to="/refund-policy" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t('footer.refundPolicy')}</Link>
            <Link to="/terms-of-service" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t('footer.termsOfService')}</Link>
          </div>

        </div>

        {/* Final Row: Copyright & Pricing Info */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[13px] font-medium text-slate-400 dark:text-slate-500 mt-2 tracking-normal">
          <p className="mb-2 md:mb-0 text-center md:text-left">
            {t('footer.copyright').replace('{{year}}', new Date().getFullYear())}
          </p>
          <p>
            {t('footer.pricingInfo')}
          </p>
        </div>

      </div>
    </footer>
  );
};