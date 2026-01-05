'use client';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get referral code from URL query parameter
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
    
    // Pre-fill email and name if redirected from Google OAuth
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    if (emailParam) {
      setEmail(emailParam);
    }
    if (nameParam) {
      setName(nameParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, referralCode: referralCode || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create account');
        return;
      }

      // Sign in after signup
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      setError('Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Store referral code in localStorage before OAuth redirect
    if (referralCode) {
      localStorage.setItem('pendingReferralCode', referralCode);
    }
    signIn('google', { callbackUrl: '/auth/complete-signup' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Lottie Animation */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <link rel="preload" as="script" href="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" />
                <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" type="module"></script>
                <div className="relative h-96 flex items-center justify-center">
                  <dotlottie-wc 
                    src="https://lottie.host/cb7f540e-83b8-467c-ae10-5f0f75b1503c/c0cPuwlhUU.lottie" 
                    style={{width: '100%', height: '400px'}} 
                    autoplay 
                    loop>
                  </dotlottie-wc>
                  {/* Loading placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse pointer-events-none">
                    <div className="text-white/60 text-sm">Loading animation...</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome to Yaddis</h2>
                <p className="text-white/80">Join thousands of happy customers enjoying fresh products delivered to their door</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
        {/* Mobile Animation - Top */}
        <div className="lg:hidden mb-8 flex justify-center">
          <div className="relative w-full max-w-xs h-64 flex items-center justify-center bg-white/5 rounded-2xl">
            <link rel="preload" as="script" href="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" />
            <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" type="module"></script>
            <dotlottie-wc 
              src="https://lottie.host/cb7f540e-83b8-467c-ae10-5f0f75b1503c/c0cPuwlhUU.lottie" 
              style={{width: '100%', height: '250px'}} 
              autoplay 
              loop>
            </dotlottie-wc>
            {/* Loading placeholder */}
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <div className="text-white/60 text-sm">Loading animation...</div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-dark mb-2">Join Yaddis</h1>
          <p className="text-brand-secondary">Create your account to start shopping</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white rounded-lg shadow-lg border border-brand-accent/20 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 px-6 py-4 border-b border-brand-accent/20">
            <h2 className="text-xl font-bold text-brand-dark">Create Account</h2>
            <p className="text-sm text-brand-secondary mt-1">Quick and easy signup</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Referral Code Input */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-brand-dark mb-2">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="w-full px-4 py-3 border border-brand-accent/20 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              {referralCode && (
                <div className="mt-2 flex items-center gap-2 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">Referral code applied! You'll earn bonus points on your first purchase.</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-brand-accent/30 rounded hover:bg-brand-light transition-all font-semibold text-brand-dark hover:scale-105 transform transition-transform duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign Up with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-accent/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-brand-secondary">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-brand-dark mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-brand-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-brand-dark mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-brand-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-brand-dark mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full px-4 py-3 border border-brand-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-brand-light border-t border-brand-accent/20 text-center">
            <p className="text-sm text-brand-secondary">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-brand-primary hover:text-brand-secondary font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg border border-brand-accent/20 text-center">
          <p className="text-xs text-brand-secondary">
            Your information is secure and will only be used for your account
          </p>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
