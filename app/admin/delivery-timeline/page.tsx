'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface DeliveryData {
  id: string;
  orderId: string;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  order: {
    customerName: string;
    total: number;
    section: string;
  };
}

interface TimelineMetrics {
  totalDeliveries: number;
  deliveredCount: number;
  pendingCount: number;
  averageDeliveryTime: number;
  averageConfirmationTime: number;
  averageShippingTime: number;
  fastestDelivery: number;
  slowestDelivery: number;
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateDeliveryTime = (createdAt: string, deliveredAt: string | null): number | null => {
  if (!deliveredAt) return null;
  const created = new Date(createdAt);
  const delivered = new Date(deliveredAt);
  return Math.round((delivered.getTime() - created.getTime()) / (1000 * 60 * 60));
};

const calculateConfirmationTime = (createdAt: string, confirmedAt: string | null): number | null => {
  if (!confirmedAt) return null;
  const created = new Date(createdAt);
  const confirmed = new Date(confirmedAt);
  return Math.round((confirmed.getTime() - created.getTime()) / (1000 * 60));
};

const calculateShippingTime = (shippedAt: string | null, deliveredAt: string | null): number | null => {
  if (!shippedAt || !deliveredAt) return null;
  const shipped = new Date(shippedAt);
  const delivered = new Date(deliveredAt);
  return Math.round((delivered.getTime() - shipped.getTime()) / (1000 * 60 * 60));
};

export default function DeliveryTimelinePage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<TimelineMetrics | null>(null);
  const [section, setSection] = useState<'ALL' | 'FOOD' | 'HOUSEHOLD'>('ALL');

  useEffect(() => {
    fetchDeliveries();
  }, [section]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      let deliveriesData: DeliveryData[] = [];

      if (section === 'ALL') {
        const [foodRes, householdRes] = await Promise.all([
          fetch('/api/admin/deliveries?section=FOOD'),
          fetch('/api/admin/deliveries?section=HOUSEHOLD'),
        ]);

        if (!foodRes.ok || !householdRes.ok) throw new Error('Failed to fetch deliveries');

        const foodData = await foodRes.json();
        const householdData = await householdRes.json();
        deliveriesData = [...foodData, ...householdData];
      } else {
        const url = `/api/admin/deliveries?section=${section}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch deliveries');
        deliveriesData = await response.json();
      }

      setDeliveries(deliveriesData);
      calculateMetrics(deliveriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (deliveriesData: DeliveryData[]) => {
    const deliveryTimes: number[] = [];
    const confirmationTimes: number[] = [];
    const shippingTimes: number[] = [];
    let deliveredCount = 0;
    let pendingCount = 0;

    deliveriesData.forEach(delivery => {
      if (delivery.status === 'DELIVERED') {
        deliveredCount++;
        const deliveryTime = calculateDeliveryTime(delivery.createdAt, delivery.deliveredAt);
        if (deliveryTime !== null) {
          deliveryTimes.push(deliveryTime);
        }

        const shippingTime = calculateShippingTime(delivery.shippedAt, delivery.deliveredAt);
        if (shippingTime !== null) {
          shippingTimes.push(shippingTime);
        }
      } else if (delivery.status === 'PENDING') {
        pendingCount++;
      }

      const confirmationTime = calculateConfirmationTime(delivery.createdAt, delivery.confirmedAt);
      if (confirmationTime !== null) {
        confirmationTimes.push(confirmationTime);
      }
    });

    const avgDeliveryTime = deliveryTimes.length > 0
      ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
      : 0;

    const avgConfirmationTime = confirmationTimes.length > 0
      ? Math.round(confirmationTimes.reduce((a, b) => a + b, 0) / confirmationTimes.length)
      : 0;

    const avgShippingTime = shippingTimes.length > 0
      ? Math.round(shippingTimes.reduce((a, b) => a + b, 0) / shippingTimes.length)
      : 0;

    const fastestDelivery = deliveryTimes.length > 0 ? Math.min(...deliveryTimes) : 0;
    const slowestDelivery = deliveryTimes.length > 0 ? Math.max(...deliveryTimes) : 0;

    setMetrics({
      totalDeliveries: deliveriesData.length,
      deliveredCount,
      pendingCount,
      averageDeliveryTime: avgDeliveryTime,
      averageConfirmationTime: avgConfirmationTime,
      averageShippingTime: avgShippingTime,
      fastestDelivery,
      slowestDelivery,
    });
  };

  const delivered = deliveries.filter(d => d.status === 'DELIVERED');
  const pending = deliveries.filter(d => d.status === 'PENDING');
  const shipped = deliveries.filter(d => d.status === 'SHIPPED');
  const confirmed = deliveries.filter(d => d.status === 'CONFIRMED');

  const getDeliveryTimeColor = (hours: number) => {
    if (hours <= 24) return 'bg-green-100 text-green-800';
    if (hours <= 48) return 'bg-yellow-100 text-yellow-800';
    if (hours <= 72) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {loading ? (
        <LoadingScreen
          title="Loading Timeline Data"
          message="Analyzing delivery performance..."
          steps={['Fetching deliveries', 'Calculating metrics', 'Generating charts']}
        />
      ) : (
        <>
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Delivery Timeline Analytics</h1>
        <p className="text-gray-600">Visual analytics of delivery times and performance</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Section</label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value as 'ALL' | 'FOOD' | 'HOUSEHOLD')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-48"
        >
          <option value="ALL">All Deliveries</option>
          <option value="FOOD">Food Only</option>
          <option value="HOUSEHOLD">Household Only</option>
        </select>
      </div>

      <div>
        <>
          {metrics && (
            <>
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{metrics.deliveredCount}</div>
                  <div className="text-gray-600 text-sm">Delivered</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {metrics.totalDeliveries > 0 ? Math.round((metrics.deliveredCount / metrics.totalDeliveries) * 100) : 0}% of total
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{metrics.averageDeliveryTime}h</div>
                  <div className="text-gray-600 text-sm">Avg Delivery Time</div>
                  <div className="text-xs text-gray-500 mt-2">From order to delivery</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{metrics.averageConfirmationTime}m</div>
                  <div className="text-gray-600 text-sm">Avg Confirmation</div>
                  <div className="text-xs text-gray-500 mt-2">Order to confirmation</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">{metrics.averageShippingTime}h</div>
                  <div className="text-gray-600 text-sm">Avg Shipping Time</div>
                  <div className="text-xs text-gray-500 mt-2">Shipped to delivered</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Time Range</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">Fastest Delivery</span>
                        <span className="text-sm font-bold text-green-600">{metrics.fastestDelivery}h</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">Average Delivery</span>
                        <span className="text-sm font-bold text-blue-600">{metrics.averageDeliveryTime}h</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">Slowest Delivery</span>
                        <span className="text-sm font-bold text-red-600">{metrics.slowestDelivery}h</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Status Distribution</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700">Delivered: {metrics.deliveredCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-gray-700">Shipped: {shipped.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700">Confirmed: {confirmed.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-700">Pending: {metrics.pendingCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800">Delivered Orders Timeline</h2>
                </div>

                {delivered.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    No delivered orders to display
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Order ID</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Customer</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Ordered</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Confirmed</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Shipped</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Delivered</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Total Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {delivered.map(delivery => {
                          const deliveryTime = calculateDeliveryTime(delivery.createdAt, delivery.deliveredAt);
                          return (
                            <tr key={delivery.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="font-mono font-semibold text-sm">{delivery.orderId.slice(0, 8)}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-700 text-sm">{delivery.order.customerName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(delivery.createdAt)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(delivery.confirmedAt)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(delivery.shippedAt)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(delivery.deliveredAt)}</td>
                              <td className="px-4 py-3">
                                {deliveryTime && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDeliveryTimeColor(deliveryTime)}`}>
                                    {deliveryTime}h
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      </div>
        </>
      )}
    </div>
  );
}
