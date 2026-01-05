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

interface PerformanceMetrics {
  totalOrders: number;
  deliveredOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimePercentage: number;
  averageDeliveryTime: number;
  medianDeliveryTime: number;
  deliveriesUnder24h: number;
  deliveries24to48h: number;
  deliveries48to72h: number;
  deliveriesOver72h: number;
  cancellationRate: number;
  completionRate: number;
  averageOrderValue: number;
}

interface DailyMetrics {
  date: string;
  delivered: number;
  onTime: number;
  late: number;
}

const calculateDeliveryTime = (createdAt: string, deliveredAt: string | null): number | null => {
  if (!deliveredAt) return null;
  const created = new Date(createdAt);
  const delivered = new Date(deliveredAt);
  return Math.round((delivered.getTime() - created.getTime()) / (1000 * 60 * 60));
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function PerformanceMetricsPage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [section, setSection] = useState<'ALL' | 'FOOD' | 'HOUSEHOLD'>('ALL');
  const [onTimeTarget] = useState(48);

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
      calculateDailyMetrics(deliveriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (deliveriesData: DeliveryData[]) => {
    const deliveredOrders = deliveriesData.filter(d => d.status === 'DELIVERED');
    const deliveryTimes: number[] = [];
    let onTimeCount = 0;
    let lateCount = 0;
    let under24h = 0;
    let h24to48 = 0;
    let h48to72 = 0;
    let over72h = 0;
    let totalRevenue = 0;

    deliveredOrders.forEach(delivery => {
      const time = calculateDeliveryTime(delivery.createdAt, delivery.deliveredAt);
      if (time !== null) {
        deliveryTimes.push(time);
        totalRevenue += delivery.order.total;

        if (time <= onTimeTarget) {
          onTimeCount++;
        } else {
          lateCount++;
        }

        if (time <= 24) under24h++;
        else if (time <= 48) h24to48++;
        else if (time <= 72) h48to72++;
        else over72h++;
      }
    });

    const sortedTimes = [...deliveryTimes].sort((a, b) => a - b);
    const medianTime = sortedTimes.length > 0
      ? sortedTimes[Math.floor(sortedTimes.length / 2)]
      : 0;

    const avgTime = deliveryTimes.length > 0
      ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
      : 0;

    const cancelledCount = deliveriesData.filter(d => d.status === 'CANCELLED').length;
    const completionRate = deliveriesData.length > 0
      ? Math.round(((deliveriesData.length - cancelledCount) / deliveriesData.length) * 100)
      : 0;

    const cancellationRate = deliveriesData.length > 0
      ? Math.round((cancelledCount / deliveriesData.length) * 100)
      : 0;

    const avgOrderValue = deliveredOrders.length > 0
      ? Math.round(totalRevenue / deliveredOrders.length)
      : 0;

    setMetrics({
      totalOrders: deliveriesData.length,
      deliveredOrders: deliveredOrders.length,
      onTimeDeliveries: onTimeCount,
      lateDeliveries: lateCount,
      onTimePercentage: deliveredOrders.length > 0 ? Math.round((onTimeCount / deliveredOrders.length) * 100) : 0,
      averageDeliveryTime: avgTime,
      medianDeliveryTime: medianTime,
      deliveriesUnder24h: under24h,
      deliveries24to48h: h24to48,
      deliveries48to72h: h48to72,
      deliveriesOver72h: over72h,
      cancellationRate,
      completionRate,
      averageOrderValue: avgOrderValue,
    });
  };

  const calculateDailyMetrics = (deliveriesData: DeliveryData[]) => {
    const metricsMap = new Map<string, { delivered: number; onTime: number; late: number }>();

    deliveriesData
      .filter(d => d.status === 'DELIVERED')
      .forEach(delivery => {
        const date = formatDate(delivery.deliveredAt || delivery.createdAt);
        const time = calculateDeliveryTime(delivery.createdAt, delivery.deliveredAt);

        if (!metricsMap.has(date)) {
          metricsMap.set(date, { delivered: 0, onTime: 0, late: 0 });
        }

        const current = metricsMap.get(date)!;
        current.delivered++;

        if (time !== null) {
          if (time <= onTimeTarget) {
            current.onTime++;
          } else {
            current.late++;
          }
        }
      });

    const daily = Array.from(metricsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    setDailyMetrics(daily);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {loading ? (
        <LoadingScreen
          title="Loading Performance Metrics"
          message="Calculating delivery performance data..."
          steps={['Fetching deliveries', 'Computing metrics', 'Generating report']}
        />
      ) : (
        <>
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Delivery Performance Metrics</h1>
        <p className="text-gray-600">Track delivery performance, efficiency, and key metrics</p>
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
                  <div className="text-2xl font-bold text-blue-600 mb-1">{metrics.deliveredOrders}</div>
                  <div className="text-gray-600 text-sm">Delivered Orders</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Out of {metrics.totalOrders} total
                  </div>
                </div>

                <div className={`rounded-lg shadow p-6 ${getPerformanceColor(metrics.onTimePercentage)}`}>
                  <div className="text-2xl font-bold mb-1">{metrics.onTimePercentage}%</div>
                  <div className="text-sm font-semibold">On-Time Rate</div>
                  <div className="text-xs mt-2">
                    {metrics.onTimeDeliveries} on-time, {metrics.lateDeliveries} late
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{metrics.averageDeliveryTime}h</div>
                  <div className="text-gray-600 text-sm">Average Delivery Time</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Median: {metrics.medianDeliveryTime}h
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">{metrics.completionRate}%</div>
                  <div className="text-gray-600 text-sm">Completion Rate</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Cancellation: {metrics.cancellationRate}%
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Time Distribution</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Under 24 hours</span>
                        <span className="text-sm font-bold text-green-600">{metrics.deliveriesUnder24h}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${metrics.deliveredOrders > 0 ? (metrics.deliveriesUnder24h / metrics.deliveredOrders) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">24-48 hours</span>
                        <span className="text-sm font-bold text-blue-600">{metrics.deliveries24to48h}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${metrics.deliveredOrders > 0 ? (metrics.deliveries24to48h / metrics.deliveredOrders) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">48-72 hours</span>
                        <span className="text-sm font-bold text-yellow-600">{metrics.deliveries48to72h}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${metrics.deliveredOrders > 0 ? (metrics.deliveries48to72h / metrics.deliveredOrders) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Over 72 hours</span>
                        <span className="text-sm font-bold text-red-600">{metrics.deliveriesOver72h}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${metrics.deliveredOrders > 0 ? (metrics.deliveriesOver72h / metrics.deliveredOrders) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Metrics</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-sm text-gray-700">Average Order Value</span>
                      <span className="text-2xl font-bold text-green-600">KES {metrics.averageOrderValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-sm text-gray-700">Total Revenue (Delivered)</span>
                      <span className="text-lg font-bold text-blue-600">
                        KES {(metrics.averageOrderValue * metrics.deliveredOrders).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Orders in Progress</span>
                      <span className="text-lg font-bold text-purple-600">
                        {metrics.totalOrders - metrics.deliveredOrders}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {dailyMetrics.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Last 7 Days Performance</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Date</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-700">Delivered</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-700">On-Time</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-700">Late</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-700">On-Time Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyMetrics.map(metric => {
                          const rate = metric.delivered > 0 ? Math.round((metric.onTime / metric.delivered) * 100) : 0;
                          return (
                            <tr key={metric.date} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold text-gray-700">{metric.date}</td>
                              <td className="px-4 py-3 text-center font-bold text-blue-600">{metric.delivered}</td>
                              <td className="px-4 py-3 text-center font-bold text-green-600">{metric.onTime}</td>
                              <td className="px-4 py-3 text-center font-bold text-red-600">{metric.late}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${rate >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {rate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="font-bold text-blue-900 mb-2">Performance Target</h3>
                <p className="text-sm text-blue-800">
                  Current on-time delivery target is set to {onTimeTarget} hours. Deliveries completed within this timeframe are considered on-time.
                </p>
              </div>
            </>
          )}
        </>
        </>
      </div>
      )}
    </div>
  );
}
