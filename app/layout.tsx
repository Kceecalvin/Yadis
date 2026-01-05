import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import AIChatbot from './components/AIChatbot';
import Navbar from './components/Navbar';
import Providers from './providers';
import WhatsAppButton from './components/WhatsAppButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'YADDPLAST - Best Siku Zote',
  description: 'Shop fresh food at YADDPLAST. Best prices, free delivery on all orders. Your trusted online marketplace.',
  icons: {
    icon: '/images/Yaddis_Logo_copy-removebg-preview.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-brand-dark`}>
        <Providers>
        <Navbar />
        <main className="flex-1 pt-28">{children}</main>
        <footer className="border-t border-brand-accent/20 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-2 text-brand-dark">About</h4>
              <p className="text-sm text-brand-secondary">Best Prices in Town. Quality food and practical plastics.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-brand-dark">Customer Care</h4>
              <ul className="space-y-1 text-sm text-brand-secondary">
                <li><Link href="/shipping" className="hover:text-brand-primary transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="/returns" className="hover:text-brand-primary transition-colors">Returns</Link></li>
                <li><Link href="/contact" className="hover:text-brand-primary transition-colors">Contact Us</Link></li>
                <li><a href="https://wa.me/254702987665" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors flex items-center gap-2">WhatsApp: 0702987665</a></li>
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
        <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
