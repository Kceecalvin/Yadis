'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

interface DeliveryDetail {
  id: string;
  orderId: string;
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    total: number;
    section: string;
    items: Array<{
      id: string;
      product: {
        titleEn: string;
        category: {
          section: string;
          titleEn: string;
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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusProgressPercent = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 25;
    case 'CONFIRMED':
      return 50;
    case 'SHIPPED':
      return 75;
    case 'DELIVERED':
      return 100;
    case 'CANCELLED':
      return 0;
    default:
      return 0;
  }
};

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id as string;

  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchDeliveryDetail();
  }, [deliveryId]);

  useEffect(() => {
    if (delivery) {
      setNewStatus(delivery.status);
      setNotes(delivery.notes || '');
    }
  }, [delivery]);

  const fetchDeliveryDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/deliveries/${deliveryId}`);
      if (!response.ok) throw new Error('Failed to fetch delivery details');
      const data = await response.json();
      setDelivery(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load delivery details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!delivery || newStatus === delivery.status) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update delivery status');
      
      const updatedDelivery = await response.json();
      setDelivery(updatedDelivery);
      setSuccessMessage('Delivery status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update delivery');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!delivery) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error('Failed to update notes');
      
      const updatedDelivery = await response.json();
      setDelivery(updatedDelivery);
      setSuccessMessage('Notes updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Delivery Details"
        message="Retrieving order information..."
        steps={['Fetching delivery', 'Processing data', 'Ready']}
      />
    );
  }

  if (error || !delivery) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/admin" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-4">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error || 'Delivery not found'}</div>
      </div>
    );
  }

  const backLink = delivery.order.section === 'FOOD' ? '/admin/food-deliveries' : '/admin/household-deliveries';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Link href={backLink} className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to {delivery.order.section === 'FOOD' ? 'Food' : 'Household'} Deliveries
        </Link>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{delivery.orderId}</h1>
            <p className="text-gray-600">Created on {formatDateTime(delivery.createdAt)}</p>
          </div>
          <span className={`px-6 py-3 rounded-full font-bold text-lg border-2 ${getStatusColor(delivery.status)}`}>
            {delivery.status}
          </span>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg border border-green-300">
          ✓ {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg border border-red-300">
          ✗ {error}
        </div>
      )}

      {/* Status Progress */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-brand-dark">Delivery Progress</h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Status Progress</span>
            <span className="font-semibold">{getStatusProgressPercent(delivery.status)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                delivery.status === 'PENDING'
                  ? 'bg-yellow-500 w-1/4'
                  : delivery.status === 'CONFIRMED'
                  ? 'bg-blue-500 w-2/4'
                  : delivery.status === 'SHIPPED'
                  ? 'bg-purple-500 w-3/4'
                  : delivery.status === 'DELIVERED'
                  ? 'bg-green-500 w-full'
                  : 'bg-red-500 w-0'
              }`}
            ></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${delivery.status === 'PENDING' || delivery.status === 'CONFIRMED' || delivery.status === 'SHIPPED' || delivery.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`}>
              ✓
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-700">Order Received</p>
              <p className="text-sm text-gray-600">{formatDateTime(delivery.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${delivery.confirmedAt ? 'bg-green-500' : 'bg-gray-300'}`}>
              ✓
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-700">Confirmed</p>
              <p className="text-sm text-gray-600">{delivery.confirmedAt ? formatDateTime(delivery.confirmedAt) : 'Pending'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${delivery.shippedAt ? 'bg-green-500' : 'bg-gray-300'}`}>
              ✓
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-700">Shipped</p>
              <p className="text-sm text-gray-600">{delivery.shippedAt ? formatDateTime(delivery.shippedAt) : 'Pending'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${delivery.deliveredAt ? 'bg-green-500' : 'bg-gray-300'}`}>
              ✓
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-700">Delivered</p>
              <p className="text-sm text-gray-600">{delivery.deliveredAt ? formatDateTime(delivery.deliveredAt) : 'Pending'}</p>
            </div>
          </div>

          {delivery.estimatedDeliveryDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                📅 <strong>Estimated Delivery:</strong> {formatDate(delivery.estimatedDeliveryDate)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Update Status */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-brand-dark">Update Delivery Status</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button
            onClick={handleStatusUpdate}
            disabled={updating || newStatus === delivery.status}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
              updating || newStatus === delivery.status
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-brand-primary text-white hover:bg-brand-secondary'
            }`}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-brand-dark">Customer Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Customer Name</p>
            <p className="text-lg font-semibold text-brand-dark">{delivery.order.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email Address</p>
            <p className="text-lg font-semibold text-brand-dark">{delivery.order.customerEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Phone Number</p>
            <p className="text-lg font-semibold text-brand-dark">{delivery.order.customerPhone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <p className="text-lg font-semibold text-brand-dark">
              {delivery.order.section === 'FOOD' ? '🍔 Food & Beverages' : '🏠 Household Essentials'}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-brand-dark">Delivery Address</h2>
        <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-brand-primary">
          <p className="text-lg font-semibold text-brand-dark">{delivery.order.deliveryAddress}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-brand-dark">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-700">Product</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">Quantity</th>
                <th className="text-right py-3 px-4 font-bold text-gray-700">Unit Price</th>
                <th className="text-right py-3 px-4 font-bold text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {delivery.order.items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-brand-dark">{item.product.titleEn}</p>
                      <p className="text-sm text-gray-600">{item.product.category.titleEn}</p>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 font-semibold">{item.quantity}</td>
                  <td className="text-right py-3 px-4 font-semibold text-brand-primary">KES {item.price.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 font-bold text-green-600">KES {(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Total */}
        <div className="mt-6 flex justify-end">
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-brand-primary">
            <div className="flex justify-between gap-8">
              <span className="font-bold text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-brand-primary">KES {delivery.order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Notes */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-brand-dark">Delivery Notes</h2>
        <div className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this delivery (e.g., special instructions, issues, etc.)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
          />
          <button
            onClick={handleNotesUpdate}
            disabled={updating}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              updating
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-brand-primary text-white hover:bg-brand-secondary'
            }`}
          >
            {updating ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8 flex gap-4">
        <Link
          href={backLink}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
        >
          Back to List
        </Link>
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
        >
          🖨️ Print Delivery Details
        </button>
      </div>
    </div>
  );
}
