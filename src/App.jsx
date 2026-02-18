import React, { useState, useEffect } from 'react';
import { Navbar } from './components/sections/Navbar';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { Author } from './components/sections/Author';
import { Reviews } from './components/sections/Reviews';
import { Chapters } from './components/sections/Chapters';
import { VideoSections } from './components/sections/VideoSections';
import { Footer } from './components/sections/Footer';
import { Checkout } from './components/checkout/Checkout';
import { Blog } from './components/sections/Blog';
import { SectionDivider } from './components/ui/SectionDivider';
import { RecommendedBooks } from './components/sections/RecommendedBooks';
import { HeroPremium } from './components/sections/HeroPremium';
import { HeroCreative } from './components/sections/HeroCreative';
import { QuoteSection } from './components/sections/QuoteSection';
import { QuoteMarquee } from './components/sections/QuoteMarquee';
import { PurchaseAlert } from './components/ui/PurchaseAlert';

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light'; 
  });

  // 2. ADD A STATE TO TRACK IF CHECKOUT IS OPEN
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. PREVENT BACKGROUND SCROLLING WHEN CHECKOUT IS OPEN
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCheckoutOpen]);


  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar theme={theme} setTheme={setTheme} />
      <main>
        <Hero onOrderClick={() => setIsCheckoutOpen(true)} />
          {/* Points to the id="features" inside your Features component */}
        <SectionDivider nextSectionId="features" />
        <Features />

        {/* Points to the id="author" inside your Author component */}
        <SectionDivider nextSectionId="author" />
        <Author />

        {/* Assuming Chapters has id="chapters" */}
        <SectionDivider nextSectionId="video" />
        <VideoSections />

        {/* Assuming Video section has id="video" */}
        <SectionDivider nextSectionId="chapters" />
        <Chapters />

        {/* Points to the id="reviews" inside your Reviews component */}
        <SectionDivider nextSectionId="reviews" />
        <Reviews />

            <QuoteMarquee />

        {/* Points to the id="blog" inside your Blog component */}
        <SectionDivider nextSectionId="blog" />
        <Blog /> {/* 2. ADD THE BLOG COMPONENT HERE, AFTER REVIEWS */}

                <HeroCreative onOrderClick={() => setIsCheckoutOpen(true)} />
          {/* The Marquee Section acting as a high-energy break */}
          <QuoteSection/>
      </main>
      <Footer />

{/* Purchase Alert Popup */}
    <PurchaseAlert />

      {/* 5. ADD THE CHECKOUT COMPONENT HERE */}
      <Checkout
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}