import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-200' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-200' },
  PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-200' },
  SHIPPED: { bg: 'bg-indigo-50', text: 'text-indigo-800', badge: 'bg-indigo-200' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-200' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-200' },
};

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
      
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    });
  };

  const getStatusStep = (status: string) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-dark mb-2">Order Tracking</h1>
          <p className="text-brand-secondary">Track and manage all your orders</p>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const colors = statusColors[order.status] || statusColors.PENDING;
              const currentStep = getStatusStep(order.status);

              return (
                <div key={order.id} className={`${colors.bg} rounded-lg shadow-md border border-brand-accent/20 p-6`}>
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-brand-dark">Order #{order.id.slice(-6).toUpperCase()}</h2>
                      <p className="text-sm text-brand-secondary mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${colors.text}`}>{formatPrice(order.totalCents)}</p>
                      <span className={`inline-block mt-2 px-4 py-2 ${colors.badge} rounded-full text-sm font-bold ${colors.text}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      {statusSteps.map((step, idx) => (
                        <div key={step} className="flex-1 flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                              idx <= currentStep ? 'bg-brand-primary scale-100' : 'bg-gray-300 scale-90'
                            }`}
                          >
                            {idx < currentStep ? '✓' : idx === currentStep ? '●' : idx + 1}
                          </div>
                          {idx < statusSteps.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-2 transition-all ${
                                idx < currentStep ? 'bg-brand-primary' : 'bg-gray-300'
                              }`}
                            ></div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-brand-secondary">
                      <span>Pending</span>
                      <span>Confirmed</span>
                      <span>Processing</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6 border-t border-brand-accent/20 pt-6">
                    <h3 className="font-bold text-brand-dark mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-brand-dark">{item.product.nameEn}</p>
                            <p className="text-sm text-brand-secondary">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-brand-primary">{formatPrice(item.priceCents * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid md:grid-cols-2 gap-4 border-t border-brand-accent/20 pt-6">
                    <div>
                      <h4 className="font-bold text-brand-dark mb-2">Delivery Address</h4>
                      <p className="text-sm text-brand-secondary">
                        {order.deliveryAddress}
                        {order.deliveryCity && `, ${order.deliveryCity}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark mb-2">Contact Info</h4>
                      <p className="text-sm text-brand-secondary">{order.customerName}</p>
                      <p className="text-sm text-brand-secondary">{order.customerPhone}</p>
                      {order.customerEmail && <p className="text-sm text-brand-secondary">{order.customerEmail}</p>}
                    </div>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="mt-6 border-t border-brand-accent/20 pt-6">
                      <h4 className="font-bold text-brand-dark mb-2">Order Notes</h4>
                      <p className="text-sm text-brand-secondary">{order.notes}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-6 flex gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors text-center"
                    >
                      View Details
                    </Link>
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <button className="flex-1 px-4 py-3 border-2 border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-light transition-colors">
                        Contact Support
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-12 text-center">
            <p className="text-brand-secondary text-lg mb-4">You haven't placed any orders yet</p>
            <Link
              href="/food"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
