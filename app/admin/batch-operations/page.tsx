'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface DeliveryItem {
  id: string;
  orderId: string;
  status: string;
  order: {
    customerName: string;
    total: number;
    section: string;
  };
  createdAt: string;
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BatchOperationsPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDeliveries, setSelectedDeliveries] = useState<Set<string>>(new Set());
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [section, setSection] = useState<'ALL' | 'FOOD' | 'HOUSEHOLD'>('ALL');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/deliveries?section=FOOD';
      
      if (section === 'HOUSEHOLD') {
        url = '/api/admin/deliveries?section=HOUSEHOLD';
      } else if (section === 'ALL') {
        // Fetch both and combine
        const [foodRes, householdRes] = await Promise.all([
          fetch('/api/admin/deliveries?section=FOOD'),
          fetch('/api/admin/deliveries?section=HOUSEHOLD'),
        ]);
        
        if (!foodRes.ok || !householdRes.ok) throw new Error('Failed to fetch deliveries');
        
        const foodData = await foodRes.json();
        const householdData = await householdRes.json();
        const combined = [...foodData, ...householdData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setDeliveries(combined);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [section]);

  const handleSelectAll = () => {
    if (selectedDeliveries.size === deliveries.length) {
      setSelectedDeliveries(new Set());
    } else {
      setSelectedDeliveries(new Set(deliveries.map(d => d.id)));
    }
  };

  const handleSelectDelivery = (id: string) => {
    const newSelected = new Set(selectedDeliveries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDeliveries(newSelected);
  };

  const handleBatchUpdate = async () => {
    if (selectedDeliveries.size === 0) {
      setError('Please select at least one delivery');
      return;
    }

    try {
      setUpdating(true);
      setError('');

      const updatePromises = Array.from(selectedDeliveries).map(id =>
        fetch(`/api/admin/deliveries/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      const responses = await Promise.all(updatePromises);
      
      const failedCount = responses.filter(r => !r.ok).length;
      const successCount = responses.filter(r => r.ok).length;

      if (failedCount > 0) {
        setError(`Updated ${successCount} deliveries, but ${failedCount} failed`);
      } else {
        setSuccessMessage(`Successfully updated ${successCount} deliveries to ${newStatus}`);
        setTimeout(() => setSuccessMessage(''), 3000);
        setSelectedDeliveries(new Set());
        fetchDeliveries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deliveries');
    } finally {
      setUpdating(false);
    }
  };

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
          title="Loading Deliveries"
          message="Preparing batch operations interface..."
          steps={['Fetching deliveries', 'Processing data', 'Ready']}
        />
      ) : (
        <>
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Batch Operations</h1>
        <p className="text-gray-600">Update multiple deliveries at once</p>
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Filter by Section</h3>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as 'ALL' | 'FOOD' | 'HOUSEHOLD')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Deliveries</option>
            <option value="FOOD">Food Only</option>
            <option value="HOUSEHOLD">Household Only</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">New Status</h3>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Selected</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{selectedDeliveries.size}</div>
          <p className="text-sm text-gray-600">{deliveries.length} total available</p>
        </div>
      </div>

      <div>
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                {selectedDeliveries.size === deliveries.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedDeliveries.size > 0 && (
                <button
                  onClick={handleBatchUpdate}
                  disabled={updating}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : `Update ${selectedDeliveries.size} Deliveries`}
                </button>
              )}
            </div>

            {deliveries.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No deliveries found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedDeliveries.size === deliveries.length && deliveries.length > 0}
                          onChange={handleSelectAll}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Order ID</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Section</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Current Status</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map(delivery => (
                      <tr key={delivery.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedDeliveries.has(delivery.id)}
                            onChange={() => handleSelectDelivery(delivery.id)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-sm">{delivery.orderId.slice(0, 8)}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{delivery.order.customerName}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold">
                            {delivery.order.section === 'FOOD' ? 'Food' : 'Household'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(delivery.status)}`}>
                            {delivery.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          KES {delivery.order.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateTime(delivery.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      </div>
        </>
      )}
    </div>
  );
}
