'use client';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { addToCart } from '@/lib/cart';
import { trackInteraction } from '@/lib/track-interactions';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ slug: string }> }

// Server component wrapper
export default function ProductPageWrapper({ params }: Props) {
  return <ProductPageClient params={params} />;
}

function ProductPageClient({ params }: Props) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      const { slug } = await params;
      const response = await fetch(`/api/products?slug=${slug}`);
      const data = await response.json();
      setProduct(data);
      setLoading(false);
      
      // Track product view for authenticated users
      if (session?.user?.id && data?.id) {
        trackInteraction(data.id, 'VIEW');
      }
    }
    loadProduct();
  }, [params, session?.user?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
      </div>
    );
  }

  if (!product) return notFound();

  const price = product.priceCents / 100;

  const handleAddToCart = () => {
    if (!product.inStock || adding) return;
    setAdding(true);
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.nameEn,
        price: price,
        imageUrl: product.imageUrl
      });
    }
    
    // Track add to cart interaction
    if (session?.user?.id) {
      trackInteraction(product.id, 'ADD_TO_CART');
    }
    
    setTimeout(() => setAdding(false), 1000);
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi, I'd like to order ${quantity}x ${product.nameEn} (KES ${(price * quantity).toLocaleString()})`;
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+254700000000';
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-brand-secondary">
        <Link href="/" className="hover:text-brand-primary">Home</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-brand-primary">
              {product.category.slug}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-brand-dark">{product.nameEn}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-light">
          <Image 
            src={product.imageUrl} 
            alt={product.nameEn} 
            fill
            className="object-cover"
            priority
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-3">{product.nameEn}</h1>
          
          {product.descriptionEn && (
            <div className="mt-3 text-brand-secondary leading-relaxed">{product.descriptionEn}</div>
          )}
          
          <div className="mt-6 text-3xl font-extrabold text-brand-primary">
            KES {price.toLocaleString()}
          </div>

          {product.inStock && (
            <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              In Stock
            </div>
          )}
          
          <div className="mt-8 space-y-4">
            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-brand-accent/30 hover:bg-brand-light font-bold text-lg"
                  disabled={!product.inStock}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border-2 border-brand-accent/30 rounded-lg px-3 py-2 font-semibold"
                  disabled={!product.inStock}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-brand-accent/30 hover:bg-brand-light font-bold text-lg"
                  disabled={!product.inStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || adding}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
                !product.inStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : adding
                  ? 'bg-green-600 text-white'
                  : 'bg-brand-primary text-white hover:bg-brand-secondary'
              }`}
            >
              {adding ? '✓ Added to Cart!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* WhatsApp Order Button */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full py-4 rounded-xl border-2 border-brand-primary text-brand-primary font-bold hover:bg-brand-light transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Order via WhatsApp
            </button>
          </div>

          {/* Product details */}
          <div className="mt-8 p-4 bg-brand-light rounded-xl">
            <h3 className="font-semibold text-brand-dark mb-2">Product Details</h3>
            <ul className="space-y-2 text-sm text-brand-secondary">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free delivery on all orders
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Quality guaranteed
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure payment options
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
