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

    // 2. ADD A STATE TO TRACK IF CHECKOUT IS OPEN
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // NEW: Function to dynamically find the book and route to its product page
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
        <Navbar theme={theme} setTheme={toggleTheme} />


        <main>

        <Hero onOrderPopup={() => setIsCheckoutOpen(true)} productRoute={handleRouteToProduct}/>

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