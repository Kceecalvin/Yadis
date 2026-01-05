'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PhoneVerification() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [maskedPhone, setMaskedPhone] = useState('');

  // Request OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setMaskedPhone(data.phone);
      setStep('otp');
      setSuccess(`OTP sent to ${data.phone}`);
      setTimeLeft(600);

      // Start countdown timer
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
      setError('Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to verify OTP');
        return;
      }

      setSuccess('Phone number verified successfully! ✓');
      
      // Store verification token
      sessionStorage.setItem('phoneVerified', 'true');
      sessionStorage.setItem('verifiedPhone', phone);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError('Error verifying OTP. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Yaddis Verification</h1>
          <p className="text-gray-600">Verify your phone number to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold text-sm">{success}</p>
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
              <p className="text-xs text-gray-500 mt-2">Enter your Kenyan phone number (07xx or +254)</p>
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
                'Send OTP'
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              We'll send you a 6-digit code via SMS
            </p>
          </form>
        ) : (
          // OTP Verification
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-brand-dark mb-2">
                Verification Code
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
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setSuccess('');
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
                    Resend OTP
                  </button>
                ) : (
                  `${formatTime(timeLeft)} remaining`
                )}
              </div>
            </div>
          </form>
        )}

        <div className="mt-8 p-4 bg-brand-light rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            🔒 Your phone number is secure and will only be used for verification
          </p>
        </div>
      </div>
    </div>
  );
}
