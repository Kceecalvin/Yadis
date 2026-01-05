'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LoadingScreen from '../../components/LoadingScreen';

interface AnalyticsData {
  period: string;
  dateRange: { start: string; end: string };
  summary: {
    totalRevenue: number;
    foodRevenue: number;
    householdRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }>;
  topFoodItems: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }>;
  topHouseholdItems: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }>;
  categoryBreakdown: Array<{
    name: string;
    section: string;
    revenue: number;
    itemCount: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`/api/admin/analytics?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchAnalytics();
  }, [period]);

  // Check auth status after all hooks
  if (status === 'loading') {
    return (
      <LoadingScreen
        title="Loading Analytics"
        message="Preparing your dashboard with the latest data..."
        steps={['Fetching data', 'Calculating metrics', 'Generating reports']}
      />
    );
  }

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRevenuePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-brand-dark">Analytics Dashboard</h1>
              <p className="text-brand-secondary mt-2">Track your business performance</p>
            </div>
            <Link href="/admin/promotions" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors">
              Manage Promotions
            </Link>
          </div>

          {/* Period Filter */}
          <div className="flex gap-3">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  period === p
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'bg-white text-brand-dark border-2 border-brand-primary/20 hover:border-brand-primary'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Info */}
        {analytics && (
          <div className="mb-6 text-sm text-brand-secondary">
            Showing data from {formatDate(analytics.dateRange.start)} to {formatDate(analytics.dateRange.end)}
          </div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-brand-secondary">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <p className="text-brand-secondary text-sm font-semibold mb-2">TOTAL REVENUE</p>
                <p className="text-3xl font-bold text-brand-primary">
                  {formatCurrency(analytics.summary.totalRevenue)}
                </p>
                <p className="text-xs text-brand-secondary mt-2">{analytics.summary.totalOrders} orders</p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <p className="text-brand-secondary text-sm font-semibold mb-2">FOOD REVENUE</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(analytics.summary.foodRevenue)}
                </p>
                <p className="text-xs text-brand-secondary mt-2">
                  {getRevenuePercentage(analytics.summary.foodRevenue, analytics.summary.totalRevenue)}% of total
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <p className="text-brand-secondary text-sm font-semibold mb-2">HOUSEHOLD REVENUE</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(analytics.summary.householdRevenue)}
                </p>
                <p className="text-xs text-brand-secondary mt-2">
                  {getRevenuePercentage(analytics.summary.householdRevenue, analytics.summary.totalRevenue)}% of total
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <p className="text-brand-secondary text-sm font-semibold mb-2">AVG ORDER VALUE</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(analytics.summary.averageOrderValue)}
                </p>
                <p className="text-xs text-brand-secondary mt-2">Per transaction</p>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Food vs Household Pie Chart */}
              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <h3 className="text-xl font-bold text-brand-dark mb-6">Revenue Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-brand-dark">Food Items</span>
                      <span className="font-bold text-orange-600">
                        {formatCurrency(analytics.summary.foodRevenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full"
                        style={{
                          width: `${getRevenuePercentage(analytics.summary.foodRevenue, analytics.summary.totalRevenue)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-brand-secondary mt-1">
                      {getRevenuePercentage(analytics.summary.foodRevenue, analytics.summary.totalRevenue)}%
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-brand-dark">Household Items</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(analytics.summary.householdRevenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{
                          width: `${getRevenuePercentage(analytics.summary.householdRevenue, analytics.summary.totalRevenue)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-brand-secondary mt-1">
                      {getRevenuePercentage(analytics.summary.householdRevenue, analytics.summary.totalRevenue)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <h3 className="text-xl font-bold text-brand-dark mb-6">Category Performance</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics.categoryBreakdown
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 8)
                    .map((category, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-brand-dark">{category.name}</span>
                        <div className="text-right">
                          <p className="font-bold text-brand-primary text-sm">
                            {formatCurrency(category.revenue)}
                          </p>
                          <p className="text-xs text-brand-secondary">{category.itemCount} items sold</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <h3 className="text-xl font-bold text-brand-dark mb-6">Top Food Items</h3>
                <div className="space-y-3">
                  {analytics.topFoodItems.length > 0 ? (
                    analytics.topFoodItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div>
                          <p className="font-semibold text-brand-dark">{item.name}</p>
                          <p className="text-xs text-brand-secondary">{item.quantity} sold</p>
                        </div>
                        <p className="font-bold text-orange-600">{formatCurrency(item.revenue)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-brand-secondary">No food sales yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
                <h3 className="text-xl font-bold text-brand-dark mb-6">Top Household Items</h3>
                <div className="space-y-3">
                  {analytics.topHouseholdItems.length > 0 ? (
                    analytics.topHouseholdItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <p className="font-semibold text-brand-dark">{item.name}</p>
                          <p className="text-xs text-brand-secondary">{item.quantity} sold</p>
                        </div>
                        <p className="font-bold text-blue-600">{formatCurrency(item.revenue)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-brand-secondary">No household sales yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* All Top Products */}
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
              <h3 className="text-xl font-bold text-brand-dark mb-6">Top 10 Best Sellers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-light">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-brand-dark">Product</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-brand-dark">Category</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-brand-dark">Qty Sold</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-brand-dark">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topProducts.map((product, idx) => (
                      <tr key={idx} className="border-b border-brand-accent/10 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-brand-dark">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-brand-secondary">{product.category}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-brand-dark">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-brand-primary">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-brand-secondary">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
