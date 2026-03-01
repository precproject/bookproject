import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Moon, Sun, Menu, X, Languages, ChevronDown, Check, UserCircle, ShoppingCart, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

export const Navbar = ({ theme, setTheme }) => {
  const { user, logout, openAuthModal } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState('MR');
  
  // Two refs needed because the dropdown exists in both Desktop and Mobile views
  const langRef = useRef(null);
  const mobileLangRef = useRef(null);

  const languages = [
    { code: 'mr', display: 'MR', label: 'मराठी' },
    { code: 'en', display: 'EN', label: 'English' }
  ];

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (
        (langRef.current && !langRef.current.contains(e.target)) &&
        (mobileLangRef.current && !mobileLangRef.current.contains(e.target))
      ) {
        setLangOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (langCode, displayCode) => {
    setLanguage(displayCode);
    setLangOpen(false);
    
    // Google Translate Trigger Logic
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = langCode;
      googleSelect.dispatchEvent(new Event('change'));
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  // Navigation Links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'Blog', path: '/blog' },
    { name: 'Author', path: '/#author' },
    { name: 'Chapters', path: '/#chapters' }
  ];

  const handleNavClick = (path) => {
    setIsMenuOpen(false);
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed w-full z-[100] transition-all duration-500 ${
      scrolled 
        ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl py-3 shadow-lg border-b border-slate-200/50 dark:border-slate-800/50' 
        : 'bg-transparent py-5'
    }`}>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden"></div>

      <div className="container mx-auto px-3 md:px-8 flex justify-between items-center">
        
        {/* Logo / Brand */}
        <div 
          onClick={() => handleNavClick('/')}
          className="text-xl md:text-2xl font-serif font-bold flex items-center gap-2 cursor-pointer text-slate-900 dark:text-white group"
        >
          <div className="bg-orange-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform ">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="tracking-tight hidden sm:block">
            Sahakar<span className="text-orange-600">Stree</span>
          </span>
          {/* Extremely compact logo for very small mobile screens to fit icons */}
          <span className="tracking-tight sm:hidden text-lg">
            Sahakar<span className="text-orange-600">Stree</span>
          </span>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden lg:flex items-center gap-8">
          
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button 
                  key={link.name} 
                  onClick={() => handleNavClick(link.path)}
                  className={`text-sm font-semibold transition-colors ${
                    isActive 
                      ? 'text-orange-600 dark:text-orange-500' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Actions & Utilities */}
          <div className="flex items-center gap-4">
            
            {/* Desktop Language Selector */}
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-bold"
              >
                <Languages size={14} />
                <span>{language}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code, lang.display)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                      >
                        <span className={language === lang.display ? 'font-bold text-orange-600' : 'text-slate-600 dark:text-slate-300'}>
                          {lang.label}
                        </span>
                        {language === lang.display && <Check size={14} className="text-orange-600" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform"
            >
              {theme === 'dark' ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} />}
            </button>

            {/* Desktop User Auth / Cart Section */}
            {user ? (
              <div className="flex items-center gap-2 ml-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <Link to="/checkout" className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-colors" title="Cart / Checkout">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-orange-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                      {cartCount}
                    </span>
                  )}
                </Link>
                
                <Link to={user.role === 'Admin' ? "/admin" : "/dashboard"} className="p-2 text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-colors" title="Dashboard">
                  <LayoutDashboard size={20} />
                </Link>

                <button onClick={handleLogout} className="p-2 text-red-500 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Button onClick={openAuthModal} variant="primary" className="px-6 py-2.5 text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2 ml-2">
                <UserCircle size={18} /> Login
              </Button>
            )}

          </div>
        </div>

        {/* --- MOBILE NAVIGATION TOGGLES (Always Visible on Top) --- */}
        <div className="lg:hidden flex items-center gap-1.5 sm:gap-3">
           
          {/* Mobile Language Selector */}
          <div className="relative" ref={mobileLangRef}>
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="p-1.5 text-slate-700 dark:text-slate-200 flex items-center flex-col gap-0.5"
            >
              <Languages size={18} />
              <span className="text-[9px] font-bold uppercase">{language}</span>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code, lang.display)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    >
                      <span className={language === lang.display ? 'font-bold text-orange-600' : 'text-slate-600 dark:text-slate-300'}>
                        {lang.label}
                      </span>
                      {language === lang.display && <Check size={14} className="text-orange-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Theme Toggle */}
          <button onClick={toggleTheme} className="p-1.5 text-slate-700 dark:text-slate-200">
            {theme === 'dark' ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} />}
          </button>

          {/* Mobile Login / Profile */}
          {user ? (
            <Link to={user.role === 'Admin' ? "/admin" : "/dashboard"} className="p-1.5 text-slate-700 dark:text-slate-200">
              <UserCircle size={20} />
            </Link>
          ) : (
            <button onClick={openAuthModal} className="p-1.5 text-slate-700 dark:text-slate-200">
              <UserCircle size={20} />
            </button>
          )}

          {/* Mobile Cart Preview */}
          {user && (
            <Link to="/checkout" className="relative p-1.5 text-slate-700 dark:text-slate-200">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center border border-white dark:border-slate-950">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Hamburger Menu */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 ml-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col h-[100dvh] overflow-y-auto"
          >
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
               <div className="text-xl font-serif font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="bg-orange-600 p-1.5 rounded-lg">
                  <BookOpen className="text-white" size={18} />
                </div>
                <span>Sahakar<span className="text-orange-600">Stree</span></span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>

            {/* Mobile Menu Links */}
            <div className="flex flex-col gap-2 p-6 sm:p-8 flex-1">
              {navLinks.map((link) => (
                <button 
                  key={link.name} 
                  onClick={() => handleNavClick(link.path)}
                  className={`text-2xl font-bold text-left py-4 border-b border-slate-100 dark:border-slate-800/50 ${
                    location.pathname === link.path ? 'text-orange-600 dark:text-orange-500' : 'text-slate-800 dark:text-white'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Mobile Menu Footer (Auth Actions Only) */}
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900 shrink-0 space-y-6">
              
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 py-2 px-1 text-slate-500 dark:text-slate-400 text-sm font-bold">
                    <UserCircle size={18} /> Logged in as: {user.name}
                  </div>
                  
                  <Link to="/checkout" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-3.5 px-5 bg-white dark:bg-slate-800 rounded-xl font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3"><ShoppingCart size={20} className="text-slate-400" /> Checkout</div>
                    {cartCount > 0 && <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs">{cartCount} Items</span>}
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link to={user.role === 'Admin' ? "/admin" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 rounded-xl font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
                      <LayoutDashboard size={18} className="text-slate-400" /> Dashboard
                    </Link>
                    
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-3.5 bg-red-50 dark:bg-red-900/20 rounded-xl font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => { openAuthModal(); setIsMenuOpen(false); }} variant="primary" className="w-full py-4 text-lg flex justify-center items-center gap-3 shadow-orange-500/25">
                  <UserCircle size={22} /> Login / Register
                </Button>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </nav>
  );
};