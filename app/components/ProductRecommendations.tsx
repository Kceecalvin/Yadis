'use client';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  slug: string;
  nameEn: string;
  priceCents: number;
  imageUrl: string;
  inStock: boolean;
}

export default function ProductRecommendations({ currentProductId }: { currentProductId?: string }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((products: Product[]) => {
        // Simple AI: Recommend random products (excluding current)
        const filtered = currentProductId 
          ? products.filter(p => p.id !== currentProductId)
          : products;
        
        // Shuffle and take 4
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        setRecommendations(shuffled.slice(0, 4));
        setLoading(false);
      });
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-xl h-72"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {recommendations.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          slug={p.slug}
          name={p.nameEn}
          price={p.priceCents / 100}
          imageUrl={p.imageUrl || ''}
          inStock={p.inStock}
        />
      ))}
    </div>
  );
}
