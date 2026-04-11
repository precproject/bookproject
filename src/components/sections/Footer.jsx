import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { 
  BookOpen, Facebook, Twitter, Instagram, Linkedin, 
  Phone, Mail, ArrowRight, Youtube, ShieldCheck
} from 'lucide-react';
import apiClient from '../../api/client';

const PaymentBadges = ({ t }) => {
  const images = [
    "https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/01e4b9ae-5bd1-4d36-b19a-647d36eff900/w=420,sharpen=1",
    "https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/0dad6858-9c10-40d1-7258-0b606f111e00/w=320,sharpen=1",
    "https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/eea0da37-b667-4d93-3e73-ce63b3b81400/public",
    "https://www.hostinger.com/cdn-cgi/imagedelivery/LqiWLm-3MGbYHtFuUbcBtA/8c07a3ee-6954-4b35-f511-ae9011dbfd00/w=320,sharpen=1"
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-green-600 dark:text-green-500" />
        <span className="text-[11px] font-mukta font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {t('footer.securePayment', '100% Secure Checkout')}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {images.map((img, i) => (
          <div key={i} className="glass-card rounded-lg h-9 w-14 flex items-center justify-center overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <img src={img} className="object-contain p-1" alt="Payment Gateway" loading="lazy" />
          </div>
        ))}
        <span className="text-xs font-mukta font-bold text-slate-500 dark:text-slate-400 ml-1">
          {t('footer.andMore', '& More')}
        </span>
      </div>
    </div>
  );
};

export const Footer = () => {
  const { t } = useTranslation();
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await apiClient.get('/blogs', { params: { limit: 2 } });
        setRecentBlogs(res.data.blogs || []);
      } catch (e) {
        console.error("Failed to fetch recent blogs for footer", e);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  const exploreLinks = [
    { name: t('footer.exploreLinks.store', 'Store'), path: '/store' },
    { name: t('footer.exploreLinks.blog', 'Blog'), path: '/blog' },
    { name: t('footer.exploreLinks.aboutAuthor', 'About Author'), path: '/#author' },
    { name: t('footer.exploreLinks.trackOrder', 'Track Order'), path: '/dashboard' }
  ];

  const socialLinks = [
    { Icon: Linkedin, href: "#", label: "LinkedIn" },
    { Icon: Facebook, href: "#", label: "Facebook" },
    { Icon: Instagram, href: "#", label: "Instagram" },
    { Icon: Twitter, href: "#", label: "Twitter" },
    { Icon: Youtube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="relative border-t border-slate-200 dark:border-slate-800/50 pt-20 pb-8 overflow-hidden z-0">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          
          {/* ABOUT */}
          <div className="md:col-span-1">
            <h4 className="font-rozha text-2xl text-slate-900 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-none">
              {t('footer.aboutUs', 'About Us')}
            </h4>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed font-mukta">
              {t('footer.aboutDesc', 'Empowering the next generation of entrepreneurs with resilient frameworks and practical wisdom rooted in our heritage.')}
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="font-rozha text-2xl text-slate-900 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-none">
              {t('footer.explore', 'Explore')}
            </h4>
            <ul className="space-y-4">
              {exploreLinks.map(link => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-[15px] font-mukta font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-amber-400 transition-colors flex items-center gap-3 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-orange-500 dark:group-hover:bg-amber-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* BLOG */}
          <div>
            <h4 className="font-rozha text-2xl text-slate-900 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-none">
              {t('footer.recentArticles', 'Recent Articles')}
            </h4>
            <div className="space-y-5">
              {loadingBlogs ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
              ) : recentBlogs.length > 0 ? (
                recentBlogs.map(blog => (
                  <Link key={blog._id} to={`/blog/${blog.slug}`} className="group block">
                    <h5 className="text-[15px] font-bold font-mukta text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h5>
                    <span className="text-[11px] font-black uppercase tracking-widest text-orange-600 dark:text-amber-500 flex items-center gap-1.5 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {t('footer.readArticle', 'Read Article')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-[15px] font-mukta text-slate-500 dark:text-slate-400">
                  {t('footer.noArticles', 'No articles published yet.')}
                </p>
              )}
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-rozha text-2xl text-slate-900 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-none">
              {t('footer.getInTouch', 'Get In Touch')}
            </h4>
            <ul className="space-y-4 text-[15px] font-mukta font-medium text-slate-600 dark:text-slate-400">
              <li>
                <a href="mailto:hello@sahakarstree.in" className="flex items-center gap-3 hover:text-orange-600 dark:hover:text-amber-400 transition-colors">
                  <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm"><Mail size={16} /></div>
                  hello@sahakarstree.in
                </a>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-3 hover:text-orange-600 dark:hover:text-amber-400 transition-colors">
                  <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm"><Phone size={16} /></div>
                  +91 98765 43210
                </a>
              </li>
            </ul>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-8">
              {socialLinks.map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-slate-600 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-orange-500 dark:hover:bg-amber-500 transition-all duration-300 hover:-translate-y-1 shadow-sm"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="section-divider w-full mb-10 opacity-70" />

        {/* BOTTOM SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* LOGO */}
          <Link to="/" className="text-3xl font-rozha font-black flex items-center gap-3 text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-none">
            <BookOpen className="text-orange-600 dark:text-amber-500" size={28} />
            <span>
              {t('footer.brandPart1', 'Sahakar')}
              <span className="text-orange-600 dark:text-amber-500">
                {t('footer.brandPart2', 'Stree')}
              </span>
            </span>
          </Link>

          {/* PAYMENTS */}
          <PaymentBadges t={t} />

          {/* LEGAL */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-x-8 gap-y-3 text-[13px] font-mukta font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Link to="/privacy-policy" className="hover:text-orange-600 dark:hover:text-amber-400 transition-colors">{t('footer.privacyPolicy', 'Privacy Policy')}</Link>
            <Link to="/refund-policy" className="hover:text-orange-600 dark:hover:text-amber-400 transition-colors">{t('footer.refundPolicy', 'Refund Policy')}</Link>
            <Link to="/terms-of-service" className="hover:text-orange-600 dark:hover:text-amber-400 transition-colors">{t('footer.termsOfService', 'Terms of Service')}</Link>
            <Link to="/delivery-policy" className="hover:text-orange-600 dark:hover:text-amber-400 transition-colors">{t('legal.delivery.title', 'Delivery Policy')}</Link>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="text-center font-mukta font-black text-[11px] tracking-widest uppercase text-slate-400 dark:text-slate-500 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/50 opacity-80">
          {t('footer.copyright', '© {{year}} SahakarStree. All rights reserved.').replace('{{year}}', new Date().getFullYear())}
        </div>

      </div>
    </footer>
  );
};