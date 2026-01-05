'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ReferralCard() {
  const { data: session } = useSession();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReferralCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referral/generate-code');
      const data = await response.json();

      if (data.success) {
        setReferralCode(data.referralCode);
        setShareLink(data.shareLink);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session) {
    return (
      <div className="bg-brand-primary text-white rounded-lg p-6 text-center">
        <p className="mb-4">Sign in to access your referral program</p>
        <button className="px-6 py-2 bg-white text-brand-primary rounded-lg font-semibold hover:bg-brand-light transition-all">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white rounded-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Earn Rewards! 🎁</h2>
        <p className="text-white/90">Share your referral code and earn KES 500 for every friend who joins</p>
      </div>

      {referralCode ? (
        <div className="space-y-6">
          {/* Referral Code Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-sm text-white/80 mb-2">Your Referral Code</p>
            <div className="flex items-center gap-3 bg-white/20 rounded p-4">
              <code className="flex-1 text-lg font-bold tracking-wider">{referralCode}</code>
              <button
                onClick={() => copyToClipboard(referralCode)}
                className="px-4 py-2 bg-white text-brand-primary rounded font-semibold hover:bg-brand-light transition-all"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-sm text-white/80 mb-2">Your Share Link</p>
            <div className="flex items-center gap-3 bg-white/20 rounded p-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-transparent text-white outline-none"
              />
              <button
                onClick={() => shareLink && copyToClipboard(shareLink)}
                className="px-4 py-2 bg-white text-brand-primary rounded font-semibold hover:bg-brand-light transition-all"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <a
              href={`https://wa.me/?text=Join%20Yaddis%20and%20get%20KES%20500%20off!%20Use%20my%20referral%20code:%20${referralCode}%20${shareLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-brand-light transition-all text-center"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Join%20Yaddis%20with%20my%20referral%20code:%20${referralCode}%20${shareLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-brand-light transition-all text-center"
            >
              Twitter
            </a>
          </div>

          {/* Rewards Info */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold">KES 500</div>
              <p className="text-sm text-white/80">You Earn</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">KES 500</div>
              <p className="text-sm text-white/80">Friend Earns</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={generateReferralCode}
            disabled={loading}
            className="px-8 py-4 bg-white text-brand-primary rounded-lg font-bold text-lg hover:bg-brand-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate My Referral Code'}
          </button>
        </div>
      )}
    </div>
  );
}
