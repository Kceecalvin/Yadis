'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  type: string;
  targetUrl?: string;
}

interface BusinessPromotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: string;
  isBusinessPromotion: boolean;
}

// Fallback business promotions when no active campaigns
const BUSINESS_PROMOTIONS: BusinessPromotion[] = [
  {
    id: 'business-1',
    title: 'Fresh Bakery',
    description: 'Freshly baked bread, pastries, and traditional Kenyan bakery items. Delivered hot to your door!',
    imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b75?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'BAKERY',
    isBusinessPromotion: true,
  },
  {
    id: 'business-2',
    title: 'Fast Food',
    description: 'Quick, delicious, and affordable fast food. Burgers, fries, chicken, and more! Ready in minutes!',
    imageUrl: 'https://images.unsplash.com/photo-1585238341710-4dd0c06ff4d7?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'FASTFOOD',
    isBusinessPromotion: true,
  },
  {
    id: 'business-3',
    title: 'Swahili Dishes',
    description: 'Authentic Swahili coastal cuisine. Biryani, pilau, and traditional East African flavors. Order now!',
    imageUrl: 'https://images.unsplash.com/photo-1504674900768-8d356db80009?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'SWAHILI',
    isBusinessPromotion: true,
  },
  {
    id: 'business-4',
    title: 'Yoghurt & Juices',
    description: 'Fresh, creamy yoghurt and refreshing natural juices. Healthy & delicious beverages for the whole family!',
    imageUrl: 'https://images.unsplash.com/photo-1599599810922-1ce60f2f4ca9?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'DRINKS',
    isBusinessPromotion: true,
  },
  {
    id: 'business-5',
    title: 'Ice Cream',
    description: 'Creamy, delicious ice cream in various flavors. Perfect treat for hot Kenyan days. Free delivery!',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'ICECREAM',
    isBusinessPromotion: true,
  },
  {
    id: 'business-6',
    title: 'T-Shirts & Mug Branding',
    description: 'Custom branded t-shirts and mugs for your business or events. Professional printing with fast turnaround!',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'BRANDING',
    isBusinessPromotion: true,
  },
  {
    id: 'business-7',
    title: 'Graphics Design',
    description: 'Professional graphic design services. Logos, posters, social media content, and more. Stand out today!',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'DESIGN',
    isBusinessPromotion: true,
  },
  {
    id: 'business-8',
    title: 'CCTV Installation',
    description: 'Professional CCTV installation and security solutions. Protect your business and home 24/7!',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80&crop=entropy&cs=tinysrgb&fit=max&ixlib=rb-4.0.3',
    type: 'SECURITY',
    isBusinessPromotion: true,
  },
];

export default function PromotionalCarousel() {
  const [promotions, setPromotions] = useState<(Promotion | BusinessPromotion)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const response = await fetch('/api/promotions');
        if (response.ok) {
          const data = await response.json();
          // If we have active promotions, use them; otherwise use business promotions
          setPromotions(data.length > 0 ? data : BUSINESS_PROMOTIONS);
        } else {
          // If fetch fails, use business promotions
          setPromotions(BUSINESS_PROMOTIONS);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
        // Use business promotions as fallback
        setPromotions(BUSINESS_PROMOTIONS);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotions();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoPlay || promotions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, promotions.length]);

  if (loading || promotions.length === 0) {
    return null;
  }

  const current = promotions[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
    setAutoPlay(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
    setAutoPlay(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
  };

  const handlePromotionClick = async () => {
    // Track click
    try {
      await fetch(`/api/promotions/${current.id}/click`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open target URL if available
    if (current.targetUrl) {
      window.open(current.targetUrl, '_blank');
    }
  };

  // Touch handlers for swipe on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setAutoPlay(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe(e.changedTouches[0].clientX);
  };

  const handleSwipe = (endX: number) => {
    const distance = touchStart - endX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <div
      className="relative w-full h-56 sm:h-64 md:h-80 rounded-2xl overflow-hidden group bg-brand-light cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Container */}
      <div className="relative w-full h-full bg-brand-light overflow-hidden rounded-2xl">
        {promotions.map((promo, index) => (
          <div
            key={promo.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={promo.imageUrl}
              alt={promo.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handlePromotionClick}
              loading="lazy"
            />
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{promo.title}</h3>
                {promo.description && (
                  <p className="text-white/95 text-sm md:text-base line-clamp-2">{promo.description}</p>
                )}
                {promo.targetUrl && (
                  <button
                    onClick={handlePromotionClick}
                    className="mt-3 px-5 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-all font-semibold text-sm w-fit shadow-lg"
                  >
                    Learn More →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {promotions.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-brand-dark p-2 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Previous promotion"
          >
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-brand-dark p-2 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Next promotion"
          >
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75 w-2'
                }`}
                aria-label={`Go to promotion ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Type Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 bg-brand-primary text-white text-xs font-semibold rounded-full">
          {current.type}
        </span>
      </div>
    </div>
  );
}
