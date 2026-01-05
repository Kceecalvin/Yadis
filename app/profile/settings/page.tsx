'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { redirect } from 'next/navigation';

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-brand-accent/20 rounded-full mx-auto mb-4"></div>
          <p className="text-brand-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Implement profile update API
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block">
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark">Account Settings</h1>
          <p className="text-brand-secondary mt-2">Manage your account information and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-red-50 border-red-300 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 space-y-8">
          {/* Profile Information Section */}
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Profile Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="+254 700 000 000"
                  disabled
                />
                <p className="text-xs text-brand-secondary mt-2">
                  Phone number cannot be changed for security
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Preferences Section */}
          <div className="border-t border-brand-accent/20 pt-8">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Notification Preferences</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-brand-accent/30 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-brand-dark font-medium">New product arrivals in your favorite categories</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-brand-accent/30 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-brand-dark font-medium">Price drops on products you viewed</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-brand-accent/30 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-brand-dark font-medium">Personalized product recommendations</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-brand-accent/30 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-brand-dark font-medium">Flash sales and promotions</span>
              </label>

              <button
                onClick={() => setMessage({ type: 'success', text: 'Notification preferences updated!' })}
                className="mt-6 px-6 py-2 bg-brand-primary/10 text-brand-primary rounded-lg font-semibold hover:bg-brand-primary/20 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* Delivery Addresses Section */}
          <div className="border-t border-brand-accent/20 pt-8">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Saved Addresses</h2>

            <div className="space-y-4">
              <div className="border border-brand-accent/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-brand-dark">Home</h3>
                  <button className="text-sm text-brand-primary hover:text-brand-secondary">Edit</button>
                </div>
                <p className="text-sm text-brand-secondary">123 Main Street, Nairobi, Kenya</p>
              </div>

              <button className="w-full px-4 py-3 border-2 border-dashed border-brand-accent/30 rounded-lg text-brand-primary hover:bg-brand-light transition-colors font-semibold">
                + Add New Address
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-brand-accent/20 pt-8">
            <h2 className="text-2xl font-bold text-red-600 mb-6">Danger Zone</h2>

            <div className="space-y-3">
              <button className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                Change Password
              </button>
              <button className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
