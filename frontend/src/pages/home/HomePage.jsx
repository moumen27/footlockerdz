import React from 'react';
import HeroSection from '../../components/home/HeroSection';
import BrandRibbon from '../../components/home/BrandRibbon';
import CategorySection from '../../components/home/CategorySection';
import NewArrivalSection from '../../components/home/NewArrivalSection';
import BestSellerSection from '../../components/home/BestSellerSection';
import SocialProofSection from '../../components/home/SocialProofSection';
import LookbookSection from '../../components/home/LookbookSection';
import InstagramSection from '../../components/home/InstagramSection';
import NewsletterSection from '../../components/home/NewsletterSection';

export default function HomePage() {
  return (
    <div className="block font-sans text-sm leading-snug cursor-crosshair transition-all text-gray-900 dark:text-gray-100">
      <HeroSection />
      <BrandRibbon />
      <CategorySection />
      <NewArrivalSection />
      <BestSellerSection />
      <SocialProofSection />
      <LookbookSection />
      <InstagramSection />
      <NewsletterSection />
    </div>
  );
}
