import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { redirect, notFound } from 'next/navigation';
import OrderTracker from '@/app/components/OrderTracker';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, { bg: string; text: string; badge: string; icon: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-200', icon: '⏳' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-200', icon: '✓' },
  PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-200', icon: '⚙' },
  SHIPPED: { bg: 'bg-indigo-50', text: 'text-indigo-800', badge: 'bg-indigo-200', icon: '🚚' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-200', icon: '✓' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-200', icon: '✕' },
};

const statusMessages: Record<string, string> = {
  PENDING: 'Your order is being processed',
  CONFIRMED: 'Order confirmed! We are preparing to ship',
  PROCESSING: 'Order is being packed and prepared',
  SHIPPED: 'Your order is on its way to you',
  DELIVERED: 'Your order has been delivered',
  CANCELLED: 'Your order has been cancelled',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
      tracking: true,
    },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
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

  const colors = statusColors[order.status] || statusColors.PENDING;
  const message = statusMessages[order.status] || 'Order status updated';

  // Calculate estimated delivery
  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back Link */}
        <Link href="/orders" className="text-brand-primary hover:text-brand-secondary mb-6 inline-block font-semibold">
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className={`${colors.bg} rounded-lg shadow-md border-2 border-brand-accent/20 p-8 mb-6`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-brand-dark">Order #{order.id.slice(-6).toUpperCase()}</h1>
              <p className="text-brand-secondary mt-2">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <span className={`inline-block px-6 py-3 ${colors.badge} rounded-full text-lg font-bold ${colors.text}`}>
              {order.status}
            </span>
          </div>

          {/* Status Message */}
          <div className={`p-4 ${colors.bg} rounded-lg border-l-4 border-l-brand-primary`}>
            <p className={`text-lg font-semibold ${colors.text}`}>{message}</p>
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <p className="text-sm text-brand-secondary mt-2">
                Estimated delivery: {formatDate(estimatedDelivery)}
              </p>
            )}
          </div>
        </div>

        {/* Order Tracker */}
        <div className="mb-6">
          <OrderTracker
            currentStatus={order.tracking?.status || order.status}
            confirmedAt={order.tracking?.confirmedAt}
            shippedAt={order.tracking?.shippedAt}
            deliveredAt={order.tracking?.deliveredAt}
            estimatedDeliveryDate={order.tracking?.estimatedDeliveryDate || estimatedDelivery}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Items Card */}
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-brand-accent/10 last:border-b-0">
                    <div className="w-20 h-20 bg-brand-light rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}
                        alt={item.product.nameEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-dark">{item.product.nameEn}</h3>
                      <p className="text-sm text-brand-secondary mt-1">Quantity: {item.quantity}</p>
                      <p className="text-sm text-brand-secondary">Unit Price: {formatPrice(item.priceCents)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-primary text-lg">
                        {formatPrice(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-brand-accent/20 space-y-3">
                <div className="flex justify-between text-brand-secondary">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.totalCents)}</span>
                </div>
                <div className="flex justify-between text-brand-secondary">
                  <span>Delivery Fee:</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-brand-dark border-t border-brand-accent/20 pt-3">
                  <span>Total:</span>
                  <span className="text-brand-primary">{formatPrice(order.totalCents)}</span>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">Order Timeline</h2>
              <div className="space-y-6">
                {/* Order Placed */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">Order Placed</p>
                    <p className="text-sm text-brand-secondary">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* Confirmed */}
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 ${
                      ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    } rounded-full flex items-center justify-center flex-shrink-0 font-bold`}
                  >
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">Order Confirmed</p>
                    <p className="text-sm text-brand-secondary">Verification in progress...</p>
                  </div>
                </div>

                {/* Processing */}
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 ${
                      ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    } rounded-full flex items-center justify-center flex-shrink-0 font-bold`}
                  >
                    ⚙
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">Processing Order</p>
                    <p className="text-sm text-brand-secondary">Packing and preparing...</p>
                  </div>
                </div>

                {/* Shipped */}
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 ${
                      ['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'
                    } rounded-full flex items-center justify-center flex-shrink-0 font-bold`}
                  >
                    📦
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">Shipped</p>
                    <p className="text-sm text-brand-secondary">On its way to you...</p>
                  </div>
                </div>

                {/* Delivered */}
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 ${
                      order.status === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    } rounded-full flex items-center justify-center flex-shrink-0 font-bold`}
                  >
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">Delivered</p>
                    <p className="text-sm text-brand-secondary">Order complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Delivery Info Card */}
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">Delivery Address</h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-brand-dark">{order.customerName}</p>
                <p className="text-brand-secondary">{order.deliveryAddress}</p>
                {order.deliveryCity && <p className="text-brand-secondary">{order.deliveryCity}</p>}
                <p className="text-brand-secondary">{order.customerPhone}</p>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-brand-secondary">Email:</span>
                  <br />
                  <span className="text-brand-dark">{order.customerEmail || 'Not provided'}</span>
                </p>
                <p>
                  <span className="text-brand-secondary">Phone:</span>
                  <br />
                  <span className="text-brand-dark">{order.customerPhone}</span>
                </p>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">Need Help?</h3>
              <div className="space-y-2">
                <a 
                  href="https://wa.me/254702987665?text=Hi%20YADDIS%2C%20I%20need%20help%20with%20my%20order" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Chat on WhatsApp</span>
                </a>
                <button className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
                  Contact Support
                </button>
                {order.status === 'DELIVERED' && (
                  <button className="w-full px-4 py-2 border-2 border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-light transition-colors">
                    Write Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
