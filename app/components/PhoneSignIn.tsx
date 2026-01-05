'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function PhoneSignIn() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [maskedPhone, setMaskedPhone] = useState('');

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/phone-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send sign-in code');
        return;
      }

      setMaskedPhone(data.phone);
      setSessionId(data.sessionId);
      setStep('otp');
      setTimeLeft(600);

      // Start countdown
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Error sending sign-in code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/phone-signin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to verify sign-in code');
        return;
      }

      // Sign in with NextAuth
      const result = await signIn('credentials', {
        phone: data.user.phone,
        name: data.user.name,
        email: data.user.email,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } catch (err) {
      setError('Error verifying sign-in code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Yaddis Sign In</h1>
          <p className="text-gray-600">Quick and secure phone-based sign in</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
            <p className="text-red-800 font-semibold text-sm">{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          // Phone Number Input
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-brand-dark mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+254 712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-brand-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-2">We'll send you a sign-in code</p>
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Sign-In Code'
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full px-4 py-3 border-2 border-brand-primary text-brand-primary rounded-lg font-bold hover:bg-brand-light transition-all flex items-center justify-center gap-2 hover:scale-105 transform transition-transform duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </form>
        ) : (
          // OTP Verification
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-brand-dark mb-2">
                Sign-In Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-3 border border-brand-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center text-2xl tracking-widest font-bold"
                required
              />
              <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to {maskedPhone}</p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || timeLeft === 0}
              className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setPhone('');
                }}
                className="text-brand-primary hover:text-brand-secondary font-semibold text-sm"
              >
                Change Number
              </button>
              <div className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}>
                {timeLeft === 0 ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="text-brand-primary hover:text-brand-secondary font-semibold"
                  >
                    Resend Code
                  </button>
                ) : (
                  `${formatTime(timeLeft)} remaining`
                )}
              </div>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => {
                setStep('phone');
                setPhone('');
                setOtp('');
                setError('');
              }}
              className="text-brand-primary hover:text-brand-secondary font-semibold"
            >
              Sign up here
            </button>
          </p>
        </div>

        <div className="mt-4 p-4 bg-brand-light rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Your phone number is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
