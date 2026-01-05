'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';

interface Order {
  id: string;
  totalCents: number;
  status: string;
  createdAt: string;
  customerName?: string;
  items?: Array<{ id: string; quantity: number }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'notifications'>('overview');

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'notifications') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const [ordersRes, notificationsRes] = await Promise.all([
          fetch('/api/user/orders').catch(() => ({ ok: false })),
          fetch('/api/user/notifications').catch(() => ({ ok: false })),
        ]);

        if (ordersRes && ordersRes.ok) {
          try {
            const ordersData = await ordersRes.json();
            setOrders(ordersData);
          } catch (e) {
            console.log('Could not parse orders');
          }
        }

        if (notificationsRes && notificationsRes.ok) {
          try {
            const notificationsData = await notificationsRes.json();
            setNotifications(notificationsData);
          } catch (e) {
            console.log('Could not parse notifications');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Check loading and auth status
  if (status === 'loading') {
    return (
      <LoadingScreen
        title="Loading Profile"
        message="Retrieving your account information..."
        steps={['Authenticating', 'Loading profile', 'Syncing data']}
      />
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-brand-accent/10 text-brand-dark';
    }
  };

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-brand-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-4xl font-bold">
                  {session.user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-brand-dark">{session.user.name || 'My Account'}</h1>
                <p className="text-brand-secondary">{session.user.email || session.user.phone}</p>
                {orders.length > 0 && (
                  <p className="text-sm text-brand-secondary mt-2">
                    Member since {formatDate(orders[orders.length - 1]?.createdAt || new Date().toISOString())}
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/profile/settings"
              className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-secondary transition-colors"
            >
              Edit Profile
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-brand-light rounded-lg p-4">
              <div className="text-2xl font-bold text-brand-primary">{orders.length}</div>
              <p className="text-sm text-brand-secondary">Total Orders</p>
            </div>
            <div className="bg-brand-light rounded-lg p-4">
              <div className="text-2xl font-bold text-brand-primary">
                {orders.filter((o) => o.status.toUpperCase() === 'COMPLETED').length}
              </div>
              <p className="text-sm text-brand-secondary">Completed</p>
            </div>
            <div className="bg-brand-light rounded-lg p-4">
              <div className="text-2xl font-bold text-brand-primary">
                {notifications.filter((n) => !n.isRead).length}
              </div>
              <p className="text-sm text-brand-secondary">New Notifications</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-brand-accent/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-secondary hover:text-brand-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-secondary hover:text-brand-primary'
            }`}
          >
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors relative ${
              activeTab === 'notifications'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-secondary hover:text-brand-primary'
            }`}
          >
            Notifications
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-brand-dark mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-brand-secondary">Email</p>
                      <p className="text-brand-dark font-medium">{session.user.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-secondary">Phone</p>
                      <p className="text-brand-dark font-medium">{session.user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-brand-dark mb-4">Recent Activity</h3>
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-brand-dark">Order #{order.id.slice(-6)}</p>
                            <p className="text-xs text-brand-secondary">{formatDate(order.createdAt)}</p>
                          </div>
                          <p className="font-semibold text-brand-primary">{formatPrice(order.totalCents)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brand-secondary">No orders yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
                  <p className="text-brand-secondary">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-brand-dark">Order #{order.id.slice(-6)}</h3>
                        <p className="text-sm text-brand-secondary">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-brand-primary">{formatPrice(order.totalCents)}</p>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-brand-secondary">Items: {order.items?.length || 0}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
                  <p className="text-brand-secondary mb-4">You haven't placed any orders yet</p>
                  <Link href="/shop/food" className="text-brand-primary hover:text-brand-secondary font-semibold">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
                  <p className="text-brand-secondary">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg shadow-md border p-6 transition-all ${
                      notification.isRead
                        ? 'bg-gray-50 border-brand-accent/10'
                        : 'bg-white border-brand-primary/30 border-l-4 border-l-brand-primary'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-brand-dark">{notification.title}</h3>
                          <span className="text-xs px-2 py-1 bg-brand-primary/10 text-brand-primary rounded font-medium">
                            {notification.type}
                          </span>
                        </div>
                        <p className="text-sm text-brand-secondary">{notification.message}</p>
                        <p className="text-xs text-brand-secondary mt-2">{formatDate(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="ml-4 w-3 h-3 bg-brand-primary rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
                  <p className="text-brand-secondary">You're all caught up! No new notifications.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
