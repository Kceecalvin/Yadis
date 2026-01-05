'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface PaymentConfig {
  mpesa: {
    isEnabled: boolean;
    businessShortCode: string;
    consumerKey: string;
    consumerSecret: string;
    callbackUrl: string;
    testMode: boolean;
  };
  stripe: {
    isEnabled: boolean;
    publishableKey: string;
    secretKey: string;
    testMode: boolean;
  };
}

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'mpesa' | 'stripe' | 'test'>('mpesa');
  const [updating, setUpdating] = useState(false);

  // M-Pesa Configuration
  const [mpesaConfig, setMpesaConfig] = useState({
    isEnabled: true,
    businessShortCode: '174379',
    consumerKey: '',
    consumerSecret: '',
    callbackUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/payments/mpesa/callback`,
    testMode: true,
  });

  // Stripe Configuration
  const [stripeConfig, setStripeConfig] = useState({
    isEnabled: true,
    publishableKey: '',
    secretKey: '',
    testMode: true,
  });

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payment-config');
      if (response.ok) {
        const data = await response.json();
        setMpesaConfig(data.mpesa);
        setStripeConfig(data.stripe);
      }
    } catch (err) {
      console.error('Error fetching payment config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMpesa = async () => {
    if (!mpesaConfig.consumerKey || !mpesaConfig.consumerSecret) {
      setError('M-Pesa credentials are required');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/payment-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpesa: mpesaConfig }),
      });

      if (!response.ok) throw new Error('Failed to save M-Pesa configuration');
      setSuccessMessage('M-Pesa configuration saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveStripe = async () => {
    if (!stripeConfig.publishableKey || !stripeConfig.secretKey) {
      setError('Stripe credentials are required');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/payment-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripe: stripeConfig }),
      });

      if (!response.ok) throw new Error('Failed to save Stripe configuration');
      setSuccessMessage('Stripe configuration saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Payment Settings"
        message="Retrieving payment configuration..."
        steps={['Fetching settings', 'Loading data', 'Ready']}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Payment Settings</h1>
        <p className="text-gray-600">Configure M-Pesa and Stripe payment methods</p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg border border-green-300">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('mpesa')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'mpesa'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          M-Pesa
        </button>
        <button
          onClick={() => setActiveTab('stripe')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'stripe'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Stripe
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'test'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Test Payments
        </button>
      </div>

      {/* M-Pesa Tab */}
      {activeTab === 'mpesa' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">M-Pesa Configuration</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Getting M-Pesa Credentials</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Register on Safaricom Daraja portal (daraja.safaricom.com)</li>
              <li>Create an app to get Consumer Key and Secret</li>
              <li>Use Short Code 174379 for testing (or your own business code)</li>
              <li>Set callback URL for payment confirmations</li>
            </ol>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={mpesaConfig.isEnabled}
                  onChange={(e) => setMpesaConfig({ ...mpesaConfig, isEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">Enable M-Pesa Payments</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Short Code
              </label>
              <input
                type="text"
                value={mpesaConfig.businessShortCode}
                onChange={(e) => setMpesaConfig({ ...mpesaConfig, businessShortCode: e.target.value })}
                disabled={!mpesaConfig.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="e.g., 174379"
              />
              <p className="text-xs text-gray-500 mt-1">Your M-Pesa business short code</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Consumer Key
              </label>
              <input
                type="password"
                value={mpesaConfig.consumerKey}
                onChange={(e) => setMpesaConfig({ ...mpesaConfig, consumerKey: e.target.value })}
                disabled={!mpesaConfig.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter your consumer key"
              />
              <p className="text-xs text-gray-500 mt-1">From Daraja app credentials</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Consumer Secret
              </label>
              <input
                type="password"
                value={mpesaConfig.consumerSecret}
                onChange={(e) => setMpesaConfig({ ...mpesaConfig, consumerSecret: e.target.value })}
                disabled={!mpesaConfig.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter your consumer secret"
              />
              <p className="text-xs text-gray-500 mt-1">From Daraja app credentials</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Callback URL
              </label>
              <input
                type="text"
                value={mpesaConfig.callbackUrl}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated callback URL</p>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={mpesaConfig.testMode}
                  onChange={(e) => setMpesaConfig({ ...mpesaConfig, testMode: e.target.checked })}
                  disabled={!mpesaConfig.isEnabled}
                  className="w-5 h-5 disabled:cursor-not-allowed"
                />
                <span className="font-semibold text-gray-700">Test Mode (Sandbox)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Use test credentials for development</p>
            </div>

            <button
              onClick={handleSaveMpesa}
              disabled={updating || !mpesaConfig.isEnabled}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:bg-gray-400"
            >
              {updating ? 'Saving...' : 'Save M-Pesa Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* Stripe Tab */}
      {activeTab === 'stripe' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Stripe Configuration</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Getting Stripe Credentials</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Create account on stripe.com</li>
              <li>Go to Developers → API Keys</li>
              <li>Copy Publishable Key (starts with pk_)</li>
              <li>Copy Secret Key (starts with sk_) - Keep this secret!</li>
            </ol>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={stripeConfig.isEnabled}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, isEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">Enable Stripe Payments</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Publishable Key
              </label>
              <input
                type="password"
                value={stripeConfig.publishableKey}
                onChange={(e) => setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })}
                disabled={!stripeConfig.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="pk_live_... or pk_test_..."
              />
              <p className="text-xs text-gray-500 mt-1">Public key from Stripe dashboard</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={stripeConfig.secretKey}
                onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                disabled={!stripeConfig.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="sk_live_... or sk_test_..."
              />
              <p className="text-xs text-gray-500 mt-1">Secret key - Never share this!</p>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={stripeConfig.testMode}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, testMode: e.target.checked })}
                  disabled={!stripeConfig.isEnabled}
                  className="w-5 h-5 disabled:cursor-not-allowed"
                />
                <span className="font-semibold text-gray-700">Test Mode</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Use test keys for development</p>
            </div>

            <button
              onClick={handleSaveStripe}
              disabled={updating || !stripeConfig.isEnabled}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:bg-gray-400"
            >
              {updating ? 'Saving...' : 'Save Stripe Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* Test Payments Tab */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Test Payments</h2>

          <div className="space-y-8">
            {/* M-Pesa Test */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-300">
              <h3 className="text-lg font-bold text-green-900 mb-4">M-Pesa Test Numbers</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-green-800">Test Phone Number:</p>
                  <p className="text-sm text-green-700 font-mono">254708374149</p>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Test Amount:</p>
                  <p className="text-sm text-green-700">1 - 999999 KES</p>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Test PIN:</p>
                  <p className="text-sm text-green-700">1234</p>
                </div>
              </div>
            </div>

            {/* Stripe Test */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Stripe Test Cards</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-blue-800">Visa (Success):</p>
                  <p className="text-sm text-blue-700 font-mono">4242 4242 4242 4242</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Visa (Decline):</p>
                  <p className="text-sm text-blue-700 font-mono">4000 0000 0000 0002</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Expiry Date:</p>
                  <p className="text-sm text-blue-700">Any future date (12/34)</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-800">CVV:</p>
                  <p className="text-sm text-blue-700">Any 3 digits (123)</p>
                </div>
              </div>
            </div>

            {/* Payment Flow */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-300">
              <h3 className="text-lg font-bold text-purple-900 mb-4">Payment Flow Steps</h3>
              <ol className="text-sm text-purple-800 space-y-2 list-decimal list-inside">
                <li>Customer adds items to cart</li>
                <li>Customer proceeds to checkout</li>
                <li>Choose payment method (M-Pesa or Stripe)</li>
                <li>Enter payment details (phone for M-Pesa, card for Stripe)</li>
                <li>Confirm payment</li>
                <li>Get order confirmation</li>
                <li>Free delivery calculated based on location</li>
                <li>Order created with delivery details</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
