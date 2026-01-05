'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  className?: string;
}

export default function ProfessionalNavbar({ className = '' }: NavbarProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-3xl shadow-lg px-8 py-4 flex justify-between items-center border border-gray-100">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <svg
                  className="w-6 h-6 text-amber-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-amber-900">
              YADPLAST
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/about"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/about')
                  ? 'text-amber-800 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              About
            </Link>

            <Link
              href="/products"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/products')
                  ? 'text-amber-800 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              Products
            </Link>

            <Link
              href="/categories"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/categories')
                  ? 'text-amber-800 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              Categories
            </Link>

            <Link
              href="/orders"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/orders')
                  ? 'text-amber-800 bg-amber-50'
                  : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              Orders
            </Link>

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  moreMenuOpen
                    ? 'text-amber-800 bg-amber-50'
                    : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span>More</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    moreMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
                  <Link
                    href="/reviews"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    Customer Reviews
                  </Link>
                  <Link
                    href="/rewards"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    Rewards Program
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/map-demo"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    Delivery Tracking
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-amber-800 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                3
              </span>
            </Link>

            <Link
              href="/checkout"
              className="group relative px-5 py-2 bg-amber-800 text-white rounded-full font-medium overflow-hidden transition-all duration-300 hover:bg-amber-900 hover:shadow-lg flex items-center space-x-2"
            >
              <span>Shop Now</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-700 hover:text-pink-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
