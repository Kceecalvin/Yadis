'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [key, setKey] = useState(0);

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full bg-brand-accent/20 animate-pulse"></div>
    );
  }

  if (session?.user) {
    return (
      <div className="relative">
        {/* Profile Icon Button (Minimal) */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative w-10 h-10 rounded-full hover:ring-2 hover:ring-brand-primary transition-all overflow-hidden"
          title={session.user.name || 'My Account'}
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center font-bold text-lg">
              {session.user.name?.charAt(0) || 'U'}
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-brand-accent/20 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-accent/20">
              <p className="text-sm font-semibold text-brand-dark">{session.user.name || 'My Account'}</p>
              <p className="text-xs text-brand-secondary">{session.user.email || session.user.phone}</p>
            </div>

            <nav className="py-2">
              <Link
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-brand-light transition-colors"
              >
                <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-brand-dark">My Profile</span>
              </Link>

              <Link
                href="/profile?tab=orders"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-brand-light transition-colors"
              >
                <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.960 9.541a.999.999 0 00.908.659h8.03a1 1 0 00.992-.864l1.313-6.862A1 1 0 0015.13 2H4.08L3.622 1H3z" />
                  <path fillRule="evenodd" d="M16 16a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-brand-dark">Orders</span>
              </Link>

              <Link
                href="/profile?tab=notifications"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-brand-light transition-colors"
              >
                <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span className="text-sm text-brand-dark">Notifications</span>
              </Link>

              <Link
                href="/rewards"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-brand-light transition-colors"
              >
                <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-brand-dark">Rewards</span>
              </Link>
            </nav>

            <div className="border-t border-brand-accent/20 py-2">
              <button
                onClick={async () => {
                  setIsSigningOut(true);
                  setShowDropdown(false);
                  // Clear cart on logout
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('cart');
                    // Dispatch custom event to update cart count
                    window.dispatchEvent(new Event('cartUpdated'));
                  }
                  await signOut({ redirect: true, callbackUrl: '/' });
                  setKey(prev => prev + 1);
                }}
                disabled={isSigningOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Signing out...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9l-2.293 2.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Close dropdown when clicking outside */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/signin"
        className="group flex items-center gap-1.5 px-4 py-2.5 bg-white border-2 border-brand-primary text-brand-primary rounded-xl font-semibold hover:bg-brand-primary hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 text-sm"
      >
        <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>Sign In</span>
      </Link>
      <Link
        href="/auth/signup"
        className="group flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
      >
        <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span>Sign Up</span>
      </Link>
    </div>
  );
}
