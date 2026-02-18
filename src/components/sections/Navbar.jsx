import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = ({ theme, setTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

// THE FIX: This function explicitly flips the state between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const navLinks = ['Features', 'Author', 'Chapters', 'Reviews'];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-4 md:py-6'}`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="text-xl md:text-2xl font-serif font-bold flex items-center gap-2 cursor-pointer">
          <BookOpen className="text-orange-600" />
          <span>Booki<span className="text-orange-600">.</span></span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm lg:text-base text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
              {item}
            </a>
          ))}
{/* THE FIX: onClick={toggleTheme} added to Desktop button */}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} className="text-slate-700" />}
          </button>
          <Button variant="primary" className="px-5 py-2 text-sm">Buy Now</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2">
            {theme === 'dark' ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} className="text-slate-700" />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-900 dark:text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  {item}
                </a>
              ))}
              <Button variant="primary" className="w-full mt-4">Buy Book</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};