'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-block p-4 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6h4m-6 0h4m0 0H7m6 0h4m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-brand-dark mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Please try again or go back to the homepage.
          </p>

          {error.message && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-left">
              <p className="text-sm text-red-700 font-mono break-words">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-all"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 px-4 py-3 bg-gray-200 text-brand-dark rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
