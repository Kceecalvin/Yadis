import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import SearchBar from './components/SearchBar';
import CartButton from './components/CartButton';
import AIChatbot from './components/AIChatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Best Prices in Town | Free Delivery',
  description: 'Food and household plastics at great prices with free delivery.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-brand-light text-brand-dark`}>
        <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-brand-accent/30 shadow-md">
          {/* Top bar with announcement */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
            <div className="mx-auto max-w-7xl px-4 py-2">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free Delivery on All Orders • Best Prices Guaranteed</span>
              </div>
            </div>
          </div>
          
          {/* Main header */}
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 shrink-0 group">
                <div className="relative">
                  <img src="/images/logo.svg" alt="Logo" className="h-12 w-12 group-hover:scale-110 transition-transform" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-xl text-brand-dark leading-tight">Your Store</div>
                  <div className="text-xs text-brand-secondary leading-tight">Quality & Value</div>
                </div>
              </Link>
              
              {/* Search Bar */}
              <div className="hidden md:block flex-1 max-w-2xl">
                <SearchBar />
              </div>
              
              {/* Navigation */}
              <nav className="hidden lg:flex items-center gap-8">
                <Link href="/category/food" className="group relative py-2 text-brand-secondary hover:text-brand-primary transition-colors font-medium">
                  Food
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/category/plastics" className="group relative py-2 text-brand-secondary hover:text-brand-primary transition-colors font-medium">
                  Household
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/trending" className="group relative py-2 text-brand-secondary hover:text-brand-primary transition-colors font-medium">
                  Trending
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all"></span>
                </Link>
              </nav>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                <CartButton />
              </div>
            </div>
            
            {/* Mobile search */}
            <div className="md:hidden mt-4">
              <SearchBar />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-brand-accent/20 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-2 text-brand-dark">About</h4>
              <p className="text-sm text-brand-secondary">Best Prices in Town with Free Delivery. Quality food and practical plastics.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-brand-dark">Customer Care</h4>
              <ul className="space-y-1 text-sm text-brand-secondary">
                <li><Link href="/shipping" className="hover:text-brand-primary transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="/returns" className="hover:text-brand-primary transition-colors">Returns</Link></li>
                <li><Link href="/contact" className="hover:text-brand-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-brand-dark">Follow Us</h4>
              <div className="flex gap-3 text-sm text-brand-secondary">
                <a href="#" aria-label="WhatsApp" className="hover:text-brand-primary transition-colors">WhatsApp</a>
                <a href="#" aria-label="Instagram" className="hover:text-brand-primary transition-colors">Instagram</a>
                <a href="#" aria-label="Facebook" className="hover:text-brand-primary transition-colors">Facebook</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-brand-dark">Newsletter</h4>
              <form className="flex gap-2">
                <input className="border border-brand-accent/30 rounded px-3 py-2 flex-1 focus:outline-none focus:border-brand-primary" placeholder="Enter your email" />
                <button className="px-4 py-2 rounded bg-brand-primary text-white hover:bg-brand-secondary transition-colors">Join</button>
              </form>
            </div>
          </div>
        </footer>
        <AIChatbot />
      </body>
    </html>
  );
}
