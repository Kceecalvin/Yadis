'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  type: string;
  targetUrl?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  createdAt: string;
}

export default function CarouselManagerPage() {
  const { data: session, status } = useSession();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromos, setSelectedPromos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const response = await fetch('/api/admin/promotions');
        if (response.ok) {
          const data = await response.json();
          setPromotions(data);
          // By default, select active promotions
          setSelectedPromos(data.filter((p: Promotion) => p.isActive).map((p: Promotion) => p.id));
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotions();
  }, []);

  const handleTogglePromo = (id: string) => {
    setSelectedPromos((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPromos.length === promotions.length) {
      setSelectedPromos([]);
    } else {
      setSelectedPromos(promotions.map((p) => p.id));
    }
  };

  const carouselPromos = promotions.filter((p) => selectedPromos.includes(p.id));
  const currentPromo = carouselPromos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselPromos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselPromos.length) % carouselPromos.length);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light py-10">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-brand-secondary">Loading carousel manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/promotions" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block">
              ← Back to Promotions
            </Link>
            <h1 className="text-3xl font-bold text-brand-dark">Carousel Manager</h1>
            <p className="text-brand-secondary mt-2">Select promotions to display in the homepage carousel</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Available Promotions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-dark">Available Promotions</h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-brand-primary hover:text-brand-secondary font-semibold"
                >
                  {selectedPromos.length === promotions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {promotions.length > 0 ? (
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="flex items-center gap-4 p-4 border border-brand-accent/20 rounded-lg hover:bg-brand-light/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPromos.includes(promo.id)}
                        onChange={() => handleTogglePromo(promo.id)}
                        className="w-5 h-5 text-brand-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-brand-dark">{promo.title}</h3>
                        <div className="text-sm text-brand-secondary mt-1">
                          <p>{promo.description}</p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-xs">Views: {promo.views}</span>
                            <span className="text-xs">Clicks: {promo.clicks}</span>
                            <span className={`text-xs px-2 py-1 rounded ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {promo.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/admin/promotions/${promo.id}/edit`}
                        className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded text-sm hover:bg-brand-primary/20 transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-brand-secondary mb-4">No promotions available</p>
                  <Link
                    href="/admin/promotions/new"
                    className="inline-block px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
                  >
                    Create Promotion
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Carousel Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 overflow-hidden sticky top-4">
              <div className="p-6 border-b border-brand-accent/20">
                <h2 className="text-xl font-bold text-brand-dark">
                  Carousel Preview
                </h2>
                <p className="text-sm text-brand-secondary mt-1">
                  {carouselPromos.length} promotion{carouselPromos.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {carouselPromos.length > 0 ? (
                <div>
                  {/* Carousel Preview */}
                  <div className="relative w-full h-48 bg-brand-light overflow-hidden">
                    {currentPromo && (
                      <>
                        <img
                          src={currentPromo.imageUrl}
                          alt={currentPromo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col justify-end p-4">
                          <h3 className="text-lg font-bold text-white line-clamp-1">{currentPromo.title}</h3>
                          <p className="text-white/80 text-xs line-clamp-1">{currentPromo.description}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrev}
                        className="flex-1 px-3 py-2 bg-brand-light text-brand-dark rounded hover:bg-brand-primary/10 transition-colors text-sm font-semibold"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={handleNext}
                        className="flex-1 px-3 py-2 bg-brand-light text-brand-dark rounded hover:bg-brand-primary/10 transition-colors text-sm font-semibold"
                      >
                        Next →
                      </button>
                    </div>

                    {/* Dots */}
                    <div className="flex gap-1 justify-center">
                      {carouselPromos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentIndex ? 'bg-brand-primary w-8' : 'bg-brand-light w-2'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Info */}
                    {currentPromo && (
                      <div className="pt-3 border-t border-brand-accent/20 space-y-2">
                        <div className="text-xs text-brand-secondary">
                          <p><strong>Type:</strong> {currentPromo.type}</p>
                          <p><strong>Active:</strong> {currentPromo.isActive ? 'Yes' : 'No'}</p>
                          <p><strong>Views:</strong> {currentPromo.views}</p>
                          <p><strong>Clicks:</strong> {currentPromo.clicks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-brand-secondary text-sm">
                    Select promotions to preview the carousel
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
