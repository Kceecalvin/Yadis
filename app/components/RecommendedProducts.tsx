'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameSw: string;
  priceCents: number;
  imageUrl: string;
  category: { slug: string; titleEn: string };
}

interface RecommendedProductsProps {
  title?: string;
  limit?: number;
  className?: string;
}

export default function RecommendedProducts({
  title = 'You Might Also Like',
  limit = 8,
  className = '',
}: RecommendedProductsProps) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    async function fetchRecommendations() {
      try {
        const response = await fetch(`/api/recommendations?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [session?.user?.id, limit]);

  if (!session?.user?.id || loading || products.length === 0) {
    return null;
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    });
  };

  return (
    <section className={`py-10 ${className}`}>
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Title - NO AI BRANDING */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-dark">{title}</h2>
          <p className="text-brand-secondary mt-2">
            Products we think you'll love based on your preferences
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 overflow-hidden hover:shadow-lg hover:border-brand-primary/30 transition-all h-full flex flex-col">
                {/* Product Image */}
                <div className="relative w-full h-48 bg-brand-light overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-dark text-sm mb-2 line-clamp-2">
                      {product.nameEn}
                    </h3>
                    <p className="text-xs text-brand-secondary mb-2">
                      {product.category.titleEn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-brand-accent/20">
                    <span className="font-bold text-brand-primary text-lg">
                      {formatPrice(product.priceCents)}
                    </span>
                    <button
                      className="px-3 py-1 bg-brand-primary text-white text-sm rounded hover:bg-brand-secondary transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        // Could add to cart here
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
