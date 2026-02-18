import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Moon, Sun, Menu, X, Languages, ChevronDown, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = ({ theme, setTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState('MR'); // Default to Marathi
  const langRef = useRef(null);

  const languages = [
    { code: 'mr', display: 'MR', label: 'मराठी' },
    { code: 'en', display: 'EN', label: 'English' }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
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

  const navLinks = [
    { name: 'Features', id: 'features' },
    { name: 'Author', id: 'author' },
    { name: 'Chapters', id: 'chapters' },
    { name: 'Reviews', id: 'reviews' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-3 shadow-lg border-b border-slate-200/50 dark:border-slate-800/50' 
        : 'bg-transparent py-5'
    }`}>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden"></div>

      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        
        {/* Logo / Brand */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xl md:text-2xl font-serif font-bold flex items-center gap-2 cursor-pointer text-slate-900 dark:text-white group"
        >
          <div className="bg-orange-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="tracking-tight">
            चिंतनातून चिंतामुक्तीकडे<span className="text-orange-600">.</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={`#${link.id}`} 
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-4">
            {/* Language Selector */}
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

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform"
            >
              {theme === 'dark' ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} />}
            </button>

            <Button variant="primary" className="px-6 py-2.5 text-sm font-bold shadow-lg shadow-orange-500/25">
              Buy Now
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-3">
           <button onClick={toggleTheme} className="p-2 text-slate-700 dark:text-slate-200">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 lg:hidden bg-white dark:bg-slate-950 flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
               <div className="text-2xl font-serif font-bold flex items-center gap-2">
                <BookOpen className="text-orange-600" />
                <span>चिंतनातून चिंतामुक्तीकडे<span className="text-orange-600">.</span></span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={`#${link.id}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-bold text-slate-900 dark:text-white"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="mt-auto space-y-8">
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Language</p>
                <div className="flex gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code, lang.display)}
                      className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${
                        language === lang.display 
                        ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/10 text-orange-600' 
                        : 'border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="primary" className="w-full py-5 text-xl">Buy Now</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};