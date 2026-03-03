import React, { useState, useEffect, useContext } from 'react';
import { Navbar } from '../sections/Navbar';
import { Hero } from '../sections/Hero';
import { Features } from '../sections/Features';
import { Author } from '../sections/Author';
import { Reviews } from '../sections/Reviews';
import { Chapters } from '../sections/Chapters';
import { VideoSections } from '../sections/VideoSections';
import { Footer } from '../sections/Footer';
import { Checkout } from '../checkout/Checkout';
import { Blog } from '../sections/Blog';
import { SectionDivider } from '../ui/SectionDivider';
import { RecommendedBooks } from '../sections/RecommendedBooks';
import { HeroPremium } from '../sections/HeroPremium';
import { HeroCreative } from '../sections/HeroCreative';
import { QuoteSection } from '../sections/QuoteSection';
import { QuoteMarquee } from '../sections/QuoteMarquee';
import { PurchaseAlert } from '../ui/PurchaseAlert';
import { captureAndVerifyReferral } from '../../utils/referralManager';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

// 1. IMPORT THE CONTEXT
import { ConfigContext } from '../../context/ConfigContext';

export const HomeLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // 2. GRAB THE CONFIG FROM THE CONTEXT
  const { config } = useContext(ConfigContext);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // 3. SET SAFE DEFAULTS & MERGE WITH ADMIN CONFIG
  // If the config hasn't loaded yet, it uses these defaults so the screen isn't blank.
  const defaultSections = {
    hero: true, features: true, chapters: true, author: true,
    reviews: true, blog: true, footer: true, video: true,
    creativeHero: true, quotes: true
  };
  
  // This smoothly combines your defaults with whatever the Admin saved in the database
  const sections = { ...defaultSections, ...config?.sections };

  // Prevent background scrolling when checkout is open
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCheckoutOpen]);

  // Function to dynamically find the book and route to its product page
  const handleRouteToProduct = async () => {
    try {
      const { data } = await apiClient.get('/public/books');
      if (data && data.length > 0) {
        navigate(`/store/book/${data[0]._id}`);
      } else {
        navigate('/store');
      }
    } catch (error) {
      console.error("Failed to fetch book for routing", error);
      navigate('/store');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar theme={theme} setTheme={toggleTheme} />

      <main>
        {sections.hero && <Hero onOrderPopup={() => setIsCheckoutOpen(true)} productRoute={handleRouteToProduct}/>}

        {sections.features && <><SectionDivider nextSectionId="features" /><Features /></>}

        {sections.author && <><SectionDivider nextSectionId="author" /><Author /></>}

        {sections.video && <><SectionDivider nextSectionId="video" /><VideoSections /></>}

        {sections.chapters && <><SectionDivider nextSectionId="chapters" /><Chapters /></>}

        {sections.reviews && <><SectionDivider nextSectionId="reviews" /><Reviews /></>}

        {sections.blog && <><SectionDivider nextSectionId="blog" /><Blog /></>}

        {sections.creativeHero && <HeroCreative onOrderClick={() => setIsCheckoutOpen(true)} />}

        {sections.quotes && <QuoteSection />}
      </main>

      {sections.footer && <Footer />}

      <PurchaseAlert />

      <Checkout isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
};