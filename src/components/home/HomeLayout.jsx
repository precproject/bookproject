import React, { useState, useEffect } from 'react';
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

export const HomeLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // --- CHECKOUT STATE ---
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // --- CONFIGURATION STATE ---
  // Default to TRUE so if the backend fails, the site still works perfectly.
  const [sections, setSections] = useState({
    hero: true,
    features: true,
    chapters: true,
    author: true,
    reviews: true,
    blog: true,
    footer: true,
    // Additional sections not explicitly in DB schema yet, but kept safe here
    video: true, 
    creativeHero: true,
    quotes: true
  });

  // Fetch Public Configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Assuming your apiClient base URL handles the '/api' part
        const response = await apiClient.get('/config/public');
        if (response.data && response.data.sections) {
          // Merge backend config with our safe defaults
          setSections(prev => ({ ...prev, ...response.data.sections }));
        }
      } catch (error) {
        console.error("Failed to fetch section configuration. Using safe defaults.", error);
      }
    };
    fetchConfig();
  }, []);

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
        // Route to the first/featured book in your database
        navigate(`/store/book/${data[0]._id}`);
      } else {
        // Fallback to the store shelf if no specific book is found
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
        
        {/* HERO SECTION */}
        {sections.hero && (
          <Hero onOrderPopup={() => setIsCheckoutOpen(true)} productRoute={handleRouteToProduct}/>
        )}

        {/* FEATURES SECTION */}
        {sections.features && (
          <>
            <SectionDivider nextSectionId="features" />
            <Features />
          </>
        )}

        {/* AUTHOR SECTION */}
        {sections.author && (
          <>
            <SectionDivider nextSectionId="author" />
            <Author />
          </>
        )}

        {/* VIDEO SECTION */}
        {sections.video && (
          <>
            <SectionDivider nextSectionId="video" />
            <VideoSections />
          </>
        )}

        {/* CHAPTERS SECTION */}
        {sections.chapters && (
          <>
            <SectionDivider nextSectionId="chapters" />
            <Chapters />
          </>
        )}

        {/* REVIEWS SECTION */}
        {sections.reviews && (
          <>
            <SectionDivider nextSectionId="reviews" />
            <Reviews />
          </>
        )}

        {/* BLOG SECTION */}
        {sections.blog && (
          <>
            <SectionDivider nextSectionId="blog" />
            <Blog />
          </>
        )}

        {/* CREATIVE HERO SECTION */}
        {sections.creativeHero && (
          <HeroCreative onOrderClick={() => setIsCheckoutOpen(true)} />
        )}

        {/* QUOTES SECTION */}
        {sections.quotes && (
          <QuoteSection />
        )}

      </main>

      {/* FOOTER SECTION */}
      {sections.footer && <Footer />}

      {/* POPUPS & MODALS */}
      <PurchaseAlert />

      <Checkout
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
    </div>
  );
};