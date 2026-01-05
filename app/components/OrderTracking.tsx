'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TimelineStep {
  step: string;
  label: string;
  completed: boolean;
  date?: string;
  icon: string;
}

interface OrderItem {
  id: string;
  product: { nameEn: string; imageUrl: string };
  quantity: number;
  priceCents: number;
}

interface TrackingInfo {
  order: {
    id: string;
    totalCents: number;
    status: string;
    items: OrderItem[];
  };
  tracking: {
    currentStatus: string;
    estimatedDelivery?: string;
    notes?: string;
    timeline: TimelineStep[];
  };
}

interface Props {
  orderId: string;
}

export default function OrderTracking({ orderId }: Props) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/tracking/${orderId}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to fetch tracking');
        return;
      }

      const data = await response.json();
      setTracking(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tracking:', err);
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DELIVERED: 'text-green-600',
      SHIPPED: 'text-blue-600',
      PROCESSING: 'text-yellow-600',
      PENDING: 'text-gray-600',
      CANCELLED: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusBgColor = (status: string) => {
    const colors: Record<string, string> = {
      DELIVERED: 'bg-green-50 border-green-200',
      SHIPPED: 'bg-blue-50 border-blue-200',
      PROCESSING: 'bg-yellow-50 border-yellow-200',
      PENDING: 'bg-gray-50 border-gray-200',
      CANCELLED: 'bg-red-50 border-red-200',
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-brand-secondary">Loading order tracking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  if (!tracking) {
    return null;
  }

  const { order, tracking: trackingInfo } = tracking;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Track Your Order</h1>
        <p className="text-brand-secondary">Order ID: {order.id}</p>
      </div>

      <div className={`p-4 border rounded-lg ${getStatusBgColor(trackingInfo.currentStatus)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brand-secondary">Current Status</p>
            <p className={`text-2xl font-bold ${getStatusColor(trackingInfo.currentStatus)}`}>
              {trackingInfo.currentStatus}
            </p>
          </div>
          {trackingInfo.estimatedDelivery && (
            <div className="text-right">
              <p className="text-sm text-brand-secondary">Estimated Delivery</p>
              <p className="text-lg font-semibold text-brand-dark">
                {formatDate(trackingInfo.estimatedDelivery)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-brand-accent/20 rounded-lg p-6">
        <h2 className="text-lg font-bold text-brand-dark mb-6">Order Timeline</h2>

        <div className="space-y-6">
          {trackingInfo.timeline.map((step, index) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    step.completed ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  {step.completed ? '✓' : step.icon}
                </div>
                {index < trackingInfo.timeline.length - 1 && (
                  <div
                    className={`w-1 h-12 mt-2 ${
                      step.completed ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 py-2">
                <h3 className={`font-semibold ${getStatusColor(step.step)}`}>
                  {step.label}
                </h3>
                {step.date && (
                  <p className="text-sm text-brand-secondary mt-1">
                    {formatDate(step.date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {trackingInfo.notes && (
          <div className="mt-6 pt-6 border-t border-brand-accent/20">
            <p className="text-sm font-semibold text-brand-dark mb-2">Tracking Notes</p>
            <p className="text-sm text-brand-secondary">{trackingInfo.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-brand-accent/20 rounded-lg p-6">
        <h2 className="text-lg font-bold text-brand-dark mb-4">Order Items</h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-brand-light rounded-lg"
            >
              <img
                src={item.product.imageUrl}
                alt={item.product.nameEn}
                className="w-16 h-16 rounded object-cover"
              />

              <div className="flex-1">
                <h4 className="font-semibold text-brand-dark">
                  {item.product.nameEn}
                </h4>
                <p className="text-sm text-brand-secondary">
                  Quantity: {item.quantity} × KES {(item.priceCents / 100).toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-brand-primary">
                  KES {((item.priceCents * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-brand-accent/20 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-brand-secondary mb-1">Order Total</p>
            <p className="text-2xl font-bold text-brand-primary">
              KES {(order.totalCents / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/orders"
          className="flex-1 px-4 py-3 border border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-light transition-colors text-center"
        >
          Back to Orders
        </Link>
        <button
          onClick={fetchTracking}
          className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}
