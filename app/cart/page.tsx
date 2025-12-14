'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCart, updateQuantity, removeFromCart, getCartTotal, type CartItem } from '@/lib/cart';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const updateCart = () => setCart(getCart());
    updateCart();
    window.addEventListener('cartUpdated', updateCart);
    return () => window.removeEventListener('cartUpdated', updateCart);
  }, []);

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <svg className="mx-auto w-24 h-24 text-brand-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Your Cart is Empty</h1>
        <p className="text-brand-secondary mb-8">Start shopping to add items to your cart!</p>
        <Link href="/" className="inline-block px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-dark mb-8">Your Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white border border-brand-accent/20 rounded-xl p-4 flex gap-4">
              <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="rounded-lg object-cover" />
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-semibold text-brand-dark hover:text-brand-primary">
                  {item.name}
                </Link>
                <div className="text-brand-primary font-bold mt-1">KES {item.price.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded border border-brand-accent/30 hover:bg-brand-light">−</button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded border border-brand-accent/30 hover:bg-brand-light">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
              </div>
              <div className="text-right font-bold text-brand-dark">
                KES {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white border border-brand-accent/20 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Delivery</span>
                <span>FREE</span>
              </div>
            </div>
            <div className="border-t border-brand-accent/20 pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold text-brand-dark">
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
            </div>
            <Link href="/checkout" className="block w-full py-3 bg-brand-primary text-white rounded-xl font-bold text-center hover:bg-brand-secondary transition-colors">
              Proceed to Checkout
            </Link>
            <Link href="/" className="block w-full py-3 mt-3 border border-brand-accent/30 text-brand-dark rounded-xl font-semibold text-center hover:bg-brand-light transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
