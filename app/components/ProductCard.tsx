'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { addToCart } from '@/lib/cart';

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
}

export default function ProductCard({ id, slug, name, price, imageUrl, inStock }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  
  return (
    <Link 
      href={`/products/${slug}`} 
      className="group border border-brand-accent/20 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-light">
        {!imageError ? (
          <Image 
            src={imageUrl || '/images/logo.svg'} 
            alt={name} 
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-light">
            <span className="text-brand-secondary text-sm">No image</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-brand-dark line-clamp-2 mb-2 h-12">{name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-brand-primary">KES {price.toLocaleString()}</span>
          {inStock && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">In Stock</span>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (!inStock || adding) return;
            setAdding(true);
            addToCart({ id, slug, name, price, imageUrl });
            setTimeout(() => setAdding(false), 1000);
          }}
          disabled={!inStock || adding}
          className={`w-full py-2.5 rounded-lg transition-all font-medium shadow-sm hover:shadow-md ${
            !inStock 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : adding
              ? 'bg-green-600 text-white'
              : 'bg-brand-primary text-white hover:bg-brand-secondary'
          }`}
        >
          {adding ? '✓ Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
