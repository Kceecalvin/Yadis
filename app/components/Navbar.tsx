'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import CartButton from './CartButton';
import AuthButton from './AuthButton';

const categories = [
  {
    name: 'Food',
    href: '/food',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
      </svg>
    ),
  },
  {
    name: 'Household',
    href: '/household',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    name: 'Trending',
    href: '/trending',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18 10 11.41l4 4 6.3-6.29L22 12v-6z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      {/* Updated spacing */}
      {/* Main Navigation - WaxyWeb Style */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-6 bg-transparent">
        <div className="bg-white rounded-t-2xl rounded-b-[2rem] shadow-md px-8 py-4 border border-gray-100 flex items-center justify-between gap-4">
          {/* Logo Section - Premium Look */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-secondary/15 group-hover:from-brand-primary/25 group-hover:to-brand-secondary/25 group-hover:shadow-xl transition-all duration-300 border border-brand-primary/10">
              <img
                src="/images/Yaddis_Logo_copy-removebg-preview.png"
                alt="YADDPLAST"
                className="h-8 w-8 sm:h-10 sm:w-10 group-hover:scale-125 transition-transform duration-300 drop-shadow-sm"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-black text-brand-dark tracking-tighter">YADDPLAST</h1>
              <p className="text-xs text-brand-secondary font-bold hidden md:block uppercase tracking-wide">Best Prices • Quality</p>
            </div>
          </Link>

          {/* Search Bar - Rounded Style */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Desktop Navigation Menu - Modern Pills */}
          <nav className="hidden lg:flex items-center gap-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group flex items-center gap-2 px-5 py-3 text-brand-secondary hover:text-white font-bold text-sm transition-all duration-300 rounded-full hover:bg-gradient-to-r hover:from-brand-primary hover:to-brand-secondary hover:shadow-lg hover:shadow-brand-primary/30"
              >
                <div className="text-lg group-hover:scale-150 group-hover:rotate-12 transition-all duration-300">
                  {category.icon}
                </div>
                <span>{category.name}</span>
              </Link>
            ))}
          </nav>

          {/* Action Buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <CartButton />
            <div className="hidden md:block">
              <AuthButton />
            </div>
          </div>

          {/* Mobile Menu Toggle - Rounded Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-xl text-brand-dark hover:bg-gradient-to-br hover:from-brand-primary/10 hover:to-brand-secondary/10 transition-all duration-300 hover:shadow-md"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Mobile Cart */}
          <div className="sm:hidden">
            <CartButton />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4 mb-2">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu Dropdown - Stylish */}
      {isOpen && (
        <div className="lg:hidden border-t border-brand-primary/10 bg-gradient-to-b from-white via-brand-light/20 to-transparent backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-5 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-brand-secondary hover:text-white hover:bg-gradient-to-r hover:from-brand-primary hover:to-brand-secondary transition-all duration-300 font-bold group border border-transparent hover:border-brand-primary/30"
              >
                <div className="text-xl group-hover:scale-150 group-hover:rotate-12 transition-all duration-300">
                  {category.icon}
                </div>
                <span className="flex-1">{category.name}</span>
                <svg className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            <div className="pt-5 border-t border-brand-primary/10 mt-4">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
