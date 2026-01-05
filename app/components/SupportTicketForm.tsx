'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  orderId?: string;
  productId?: string;
  onSuccess?: () => void;
}

export default function SupportTicketForm({ orderId, productId, onSuccess }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'NORMAL',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setError('Please sign in to create a support ticket');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/support/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          orderId: orderId || null,
          productId: productId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create ticket');
        return;
      }

      setSuccess('Support ticket created! Ticket ID: ' + data.ticket.id);
      setFormData({ title: '', description: '', category: 'OTHER', priority: 'NORMAL' });

      setTimeout(() => {
        setSuccess(null);
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err) {
      setError('Error creating ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-brand-accent/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Create Support Ticket</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
          >
            <option value="PRODUCT">Product Issue</option>
            <option value="DELIVERY">Delivery Issue</option>
            <option value="PAYMENT">Payment Issue</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Title
          </label>
          <input
            type="text"
            maxLength={100}
            placeholder="Brief description of your issue"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">
            Description
          </label>
          <textarea
            maxLength={1000}
            rows={5}
            placeholder="Provide detailed information about your issue..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating Ticket...' : 'Create Support Ticket'}
        </button>
      </form>
    </div>
  );
}
