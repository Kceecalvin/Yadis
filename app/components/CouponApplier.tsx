'use client';

import { useState } from 'react';

interface DiscountInfo {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  savings: number;
}

interface Props {
  orderAmount: number;
  onCouponApplied?: (discount: DiscountInfo) => void;
  onCouponRemoved?: () => void;
}

export default function CouponApplier({
  orderAmount,
  onCouponApplied,
  onCouponRemoved,
}: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          orderAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid coupon code');
        return;
      }

      setSuccess(data.message);
      setAppliedDiscount(data.discount);
      setAppliedCode(code.toUpperCase());

      if (onCouponApplied) {
        onCouponApplied(data.discount);
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      setError('Failed to apply coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setAppliedCode(null);
    setCode('');
    setError(null);
    setSuccess(null);

    if (onCouponRemoved) {
      onCouponRemoved();
    }
  };

  // If coupon already applied
  if (appliedDiscount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold text-green-800">Coupon Applied</p>
              <p className="text-sm text-green-700">{appliedCode}</p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-sm text-green-700 hover:text-green-900 font-semibold underline"
          >
            Remove
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">Original Amount:</span>
            <span className="font-semibold text-green-900">
              KES {(appliedDiscount.originalAmount / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Discount:</span>
            <span className="font-semibold">
              -KES {(appliedDiscount.discountAmount / 100).toFixed(2)}
            </span>
          </div>
          <div className="pt-2 border-t border-green-300 flex justify-between">
            <span className="font-bold text-green-900">Final Amount:</span>
            <span className="font-bold text-lg text-green-900">
              KES {(appliedDiscount.finalAmount / 100).toFixed(2)}
            </span>
          </div>
          <div className="text-center text-xs text-green-600 mt-2">
            You save KES {(appliedDiscount.savings / 100).toFixed(2)}!
          </div>
        </div>
      </div>
    );
  }

  // Coupon input form
  return (
    <div className="bg-white border border-brand-accent/20 rounded-lg p-4">
      <h3 className="font-semibold text-brand-dark mb-3">Have a Coupon Code?</h3>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleApplyCoupon} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={20}
          className="flex-1 px-3 py-2 border border-brand-accent/20 rounded text-sm focus:outline-none focus:border-brand-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-brand-primary text-white rounded font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
      </form>

      <p className="text-xs text-brand-secondary mt-2">
        💡 Tip: Check your email for exclusive coupon codes!
      </p>
    </div>
  );
}
