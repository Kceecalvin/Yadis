'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface Notification {
  id: string;
  orderId: string;
  recipientEmail: string;
  recipientPhone: string | null;
  type: 'EMAIL' | 'SMS' | 'SYSTEM';
  status: 'SENT' | 'FAILED' | 'PENDING';
  subject: string;
  message: string;
  deliveryStatus: string;
  createdAt: string;
  sentAt: string | null;
  error: string | null;
}

interface NotificationMetrics {
  totalSent: number;
  emailsSent: number;
  smsSent: number;
  failed: number;
  pending: number;
  successRate: number;
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

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'EMAIL' | 'SMS'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SENT' | 'FAILED' | 'PENDING'>('ALL');
  const [searchOrder, setSearchOrder] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      
      if (!response.ok) {
        if (response.status === 404) {
          setNotifications([]);
          setMetrics({
            totalSent: 0,
            emailsSent: 0,
            smsSent: 0,
            failed: 0,
            pending: 0,
            successRate: 0,
          });
          return;
        }
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
      calculateMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      setNotifications([]);
      setMetrics({
        totalSent: 0,
        emailsSent: 0,
        smsSent: 0,
        failed: 0,
        pending: 0,
        successRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (notificationsData: Notification[]) => {
    const sent = notificationsData.filter(n => n.status === 'SENT').length;
    const emails = notificationsData.filter(n => n.type === 'EMAIL').length;
    const sms = notificationsData.filter(n => n.type === 'SMS').length;
    const failed = notificationsData.filter(n => n.status === 'FAILED').length;
    const pending = notificationsData.filter(n => n.status === 'PENDING').length;
    const total = notificationsData.length;

    setMetrics({
      totalSent: sent,
      emailsSent: emails,
      smsSent: sms,
      failed,
      pending,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
    });
  };

  const filteredNotifications = notifications.filter(n => {
    let typeMatch = true;
    let statusMatch = true;
    let searchMatch = true;

    if (filterType !== 'ALL') {
      typeMatch = n.type === filterType;
    }

    if (filterStatus !== 'ALL') {
      statusMatch = n.status === filterStatus;
    }

    if (searchOrder) {
      searchMatch = n.orderId.toLowerCase().includes(searchOrder.toLowerCase()) ||
                   n.recipientEmail.toLowerCase().includes(searchOrder.toLowerCase());
    }

    return typeMatch && statusMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return 'bg-blue-100 text-blue-800';
      case 'SMS':
        return 'bg-purple-100 text-purple-800';
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {loading ? (
        <LoadingScreen
          title="Loading Notifications"
          message="Retrieving customer communication history..."
          steps={['Fetching notifications', 'Processing data', 'Ready']}
        />
      ) : (
        <>
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Notification History</h1>
        <p className="text-gray-600">Track all customer communications and notifications</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      <div>
        <>
          {metrics && (
            <>
              <div className="grid md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">{metrics.totalSent}</div>
                  <div className="text-gray-600 text-sm">Sent</div>
                  <div className="text-xs text-gray-500 mt-2">{metrics.successRate}% success rate</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{metrics.emailsSent}</div>
                  <div className="text-gray-600 text-sm">Emails</div>
                  <div className="text-xs text-gray-500 mt-2">Email notifications</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{metrics.smsSent}</div>
                  <div className="text-gray-600 text-sm">SMS</div>
                  <div className="text-xs text-gray-500 mt-2">Text messages</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-red-600 mb-1">{metrics.failed}</div>
                  <div className="text-gray-600 text-sm">Failed</div>
                  <div className="text-xs text-gray-500 mt-2">Failed sends</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{metrics.pending}</div>
                  <div className="text-gray-600 text-sm">Pending</div>
                  <div className="text-xs text-gray-500 mt-2">Awaiting send</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as 'ALL' | 'EMAIL' | 'SMS')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ALL">All Types</option>
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'SENT' | 'FAILED' | 'PENDING')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SENT">Sent</option>
                      <option value="FAILED">Failed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search Order/Email</label>
                    <input
                      type="text"
                      value={searchOrder}
                      onChange={(e) => setSearchOrder(e.target.value)}
                      placeholder="Order ID or email..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="font-bold text-gray-800">
                    Notifications ({filteredNotifications.length})
                  </h2>
                </div>

                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    No notifications found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Order ID</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Recipient</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Subject</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Sent At</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNotifications.map(notification => (
                          <tr key={notification.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="font-mono font-semibold text-sm">{notification.orderId.slice(0, 8)}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div>{notification.recipientEmail}</div>
                              {notification.recipientPhone && (
                                <div className="text-xs text-gray-500">{notification.recipientPhone}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(notification.type)}`}>
                                {notification.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                              {notification.subject}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(notification.status)}`}>
                                {notification.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {notification.sentAt ? formatDateTime(notification.sentAt) : 'Not sent'}
                            </td>
                            <td className="px-4 py-3">
                              <details className="cursor-pointer">
                                <summary className="text-blue-600 hover:underline text-sm font-semibold">
                                  View
                                </summary>
                                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 w-96">
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-600 font-semibold">Message:</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{notification.message}</p>
                                  </div>
                                  {notification.error && (
                                    <div className="p-2 bg-red-50 rounded border border-red-200">
                                      <p className="text-xs text-red-600 font-semibold">Error:</p>
                                      <p className="text-xs text-red-700">{notification.error}</p>
                                    </div>
                                  )}
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                      Created: {formatDateTime(notification.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </details>
                            </td>
                          </tr>
                        ))}
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
