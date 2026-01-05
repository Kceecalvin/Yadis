'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface DeliveryRequest {
  id: string;
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    total: number;
    items: Array<{
      id: string;
      product: {
        titleEn: string;
        category: {
          section: string;
        };
      };
      quantity: number;
      price: number;
    }>;
  };
  status: string;
  estimatedDeliveryDate: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function FoodDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/deliveries?section=FOOD');
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = filter === 'ALL' 
    ? deliveries 
    : deliveries.filter(d => d.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {loading ? (
        <LoadingScreen
          title="Loading Food Deliveries"
          message="Fetching all food delivery orders..."
          steps={['Connecting to database', 'Loading deliveries', 'Ready']}
        />
      ) : (
        <>
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Food & Beverages Deliveries</h1>
        <p className="text-gray-600">Manage all food delivery requests and track their status</p>
      </div>

      <div>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="text-3xl font-bold text-yellow-600">{deliveries.filter(d => d.status === 'PENDING').length}</div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-blue-600">{deliveries.filter(d => d.status === 'CONFIRMED').length}</div>
          <div className="text-gray-600">Confirmed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-3xl font-bold text-purple-600">{deliveries.filter(d => d.status === 'SHIPPED').length}</div>
          <div className="text-gray-600">Shipped</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-3xl font-bold text-green-600">{deliveries.filter(d => d.status === 'DELIVERED').length}</div>
          <div className="text-gray-600">Delivered</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === status
                ? 'bg-brand-primary text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      {filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">No deliveries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map(delivery => (
            <div key={delivery.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark">Order #{delivery.order.id}</h3>
                    <p className="text-sm text-gray-600">Placed on {formatDateTime(delivery.createdAt)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold text-brand-dark">{delivery.order.customerName}</p>
                    <p className="text-sm text-gray-600">{delivery.order.customerEmail}</p>
                    <p className="text-sm text-gray-600">{delivery.order.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-semibold text-brand-dark">{delivery.order.deliveryAddress}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4 border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Items Ordered:</p>
                  <div className="space-y-2">
                    {delivery.order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product.titleEn} x {item.quantity}</span>
                        <span className="font-semibold">KES {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-4 border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Timeline:</p>
                  <div className="space-y-2 text-sm">
                    <div className={delivery.confirmedAt ? 'text-green-700' : 'text-gray-500'}>
                      ✓ Confirmed: {delivery.confirmedAt ? formatDateTime(delivery.confirmedAt) : 'Pending'}
                    </div>
                    <div className={delivery.shippedAt ? 'text-green-700' : 'text-gray-500'}>
                      ✓ Shipped: {delivery.shippedAt ? formatDateTime(delivery.shippedAt) : 'Pending'}
                    </div>
                    <div className={delivery.deliveredAt ? 'text-green-700' : 'text-gray-500'}>
                      ✓ Delivered: {delivery.deliveredAt ? formatDateTime(delivery.deliveredAt) : 'Pending'}
                    </div>
                    {delivery.estimatedDeliveryDate && (
                      <div className="text-blue-600">
                        📅 Est. Delivery: {formatDate(delivery.estimatedDeliveryDate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="text-lg font-bold">
                    Total: <span className="text-brand-primary">KES {delivery.order.total.toLocaleString()}</span>
                  </div>
                  <Link
                    href={`/admin/deliveries/${delivery.id}`}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
        </>
      )}
    </div>
  );
}
