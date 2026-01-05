import Link from 'next/link';
import {
  ProductIcon,
  CategoryIcon,
  PromotionIcon,
  FoodDeliveryIcon,
  AnalyticsIcon,
  PerformanceIcon,
  TimelineIcon,
  NotificationIcon,
  BatchIcon,
  CoreManagementIcon,
  DeliveryManagementIcon,
  AnalyticsReportingIcon,
  OperationsIcon,
  RewardIcon,
  ProfitabilityIcon,
  ReferralIcon,
  PaymentIcon,
  LocationIcon,
} from '@/components/Icons';

export default function AdminHome() {

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your store, track deliveries, and view analytics</p>
      
      {/* Core Management */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <CoreManagementIcon /> Core Management
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/admin/products" className="border rounded-lg p-6 hover:bg-blue-50 hover:shadow-md transition-all flex items-start gap-4">
            <ProductIcon />
            <div>
              <div className="font-bold text-brand-dark">Manage Products</div>
              <div className="text-sm text-gray-600">Add, edit, and remove products</div>
            </div>
          </Link>
          <Link href="/admin/categories" className="border rounded-lg p-6 hover:bg-blue-50 hover:shadow-md transition-all flex items-start gap-4">
            <CategoryIcon />
            <div>
              <div className="font-bold text-brand-dark">Manage Categories</div>
              <div className="text-sm text-gray-600">Organize product categories</div>
            </div>
          </Link>
          <Link href="/admin/promotions" className="border rounded-lg p-6 hover:bg-blue-50 hover:shadow-md transition-all flex items-start gap-4">
            <PromotionIcon />
            <div>
              <div className="font-bold text-brand-dark">Promotions</div>
              <div className="text-sm text-gray-600">Create and manage promotions</div>
            </div>
          </Link>
        </div>
      </div>

      {/* User Management */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          👥 User Management
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/admin/users" className="border rounded-lg p-6 hover:bg-purple-50 hover:shadow-md transition-all flex items-start gap-4">
            <div className="text-3xl">👤</div>
            <div>
              <div className="font-bold text-brand-dark">Manage Users</div>
              <div className="text-sm text-gray-600">View users and manage admin access</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Delivery Management */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <DeliveryManagementIcon /> Delivery Management
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/admin/food-deliveries" className="border rounded-lg p-6 hover:bg-green-50 hover:shadow-md transition-all flex items-start gap-4">
            <FoodDeliveryIcon />
            <div>
              <div className="font-bold text-brand-dark">Food Deliveries</div>
              <div className="text-sm text-gray-600">Track and manage food order deliveries</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <AnalyticsReportingIcon /> Analytics & Reporting
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/admin/analytics" className="border rounded-lg p-6 hover:bg-purple-50 hover:shadow-md transition-all flex items-start gap-4">
            <AnalyticsIcon />
            <div>
              <div className="font-bold text-brand-dark">Analytics Dashboard</div>
              <div className="text-sm text-gray-600">View sales metrics, top products, and customer insights</div>
            </div>
          </Link>
          <Link href="/admin/performance-metrics" className="border rounded-lg p-6 hover:bg-purple-50 hover:shadow-md transition-all flex items-start gap-4">
            <PerformanceIcon />
            <div>
              <div className="font-bold text-brand-dark">Performance Metrics</div>
              <div className="text-sm text-gray-600">Track delivery efficiency and on-time rates</div>
            </div>
          </Link>
          <Link href="/admin/delivery-timeline" className="border rounded-lg p-6 hover:bg-purple-50 hover:shadow-md transition-all flex items-start gap-4">
            <TimelineIcon />
            <div>
              <div className="font-bold text-brand-dark">Delivery Timeline</div>
              <div className="text-sm text-gray-600">Visual analytics of delivery times</div>
            </div>
          </Link>
          <Link href="/admin/notification-history" className="border rounded-lg p-6 hover:bg-purple-50 hover:shadow-md transition-all flex items-start gap-4">
            <NotificationIcon />
            <div>
              <div className="font-bold text-brand-dark">Notification History</div>
              <div className="text-sm text-gray-600">Track customer communications</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Operations */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <OperationsIcon /> Operations
        </h2>
        <div className="grid md:grid-cols-1 gap-4">
          <Link href="/admin/batch-operations" className="border rounded-lg p-6 hover:bg-indigo-50 hover:shadow-md transition-all flex items-start gap-4">
            <BatchIcon />
            <div>
              <div className="font-bold text-brand-dark">Batch Operations</div>
              <div className="text-sm text-gray-600">Update multiple deliveries at once</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Rewards & Incentives */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <RewardIcon /> Rewards & Incentives
        </h2>
        <div className="grid md:grid-cols-1 gap-4">
          <Link href="/admin/reward-configuration" className="border rounded-lg p-6 hover:bg-yellow-50 hover:shadow-md transition-all flex items-start gap-4">
            <RewardIcon />
            <div>
              <div className="font-bold text-brand-dark">Reward Configuration</div>
              <div className="text-sm text-gray-600">Configure points, tiers, and redemption options</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Revenue & Profitability */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <ProfitabilityIcon /> Revenue & Profitability
        </h2>
        <div className="grid md:grid-cols-1 gap-4">
          <Link href="/admin/profitability-settings" className="border rounded-lg p-6 hover:bg-green-50 hover:shadow-md transition-all flex items-start gap-4">
            <ProfitabilityIcon />
            <div>
              <div className="font-bold text-brand-dark">Profitability Settings</div>
              <div className="text-sm text-gray-600">Configure delivery fees, commissions, and premium features</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Referral System */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <ReferralIcon /> Referral Program
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/admin/referral-system" className="border rounded-lg p-6 hover:bg-orange-50 hover:shadow-md transition-all flex items-start gap-4">
            <ReferralIcon />
            <div>
              <div className="font-bold text-brand-dark">Referral System</div>
              <div className="text-sm text-gray-600">Manage customer referrals and track rewards</div>
            </div>
          </Link>
          <Link href="/admin/referral-analytics" className="border rounded-lg p-6 hover:bg-orange-50 hover:shadow-md transition-all flex items-start gap-4">
            <ReferralIcon />
            <div>
              <div className="font-bold text-brand-dark">Referral Analytics</div>
              <div className="text-sm text-gray-600">View ROI and referral program performance</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <PaymentIcon /> Payment & Billing
        </h2>
        <div className="grid md:grid-cols-1 gap-4">
          <Link href="/admin/payment-settings" className="border rounded-lg p-6 hover:bg-blue-50 hover:shadow-md transition-all flex items-start gap-4">
            <PaymentIcon />
            <div>
              <div className="font-bold text-brand-dark">Payment Settings</div>
              <div className="text-sm text-gray-600">Configure M-Pesa and Stripe payment methods</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Location & Delivery */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-3">
          <LocationIcon /> Location & Delivery
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/admin/delivery-zones" className="border rounded-lg p-6 hover:bg-red-50 hover:shadow-md transition-all flex items-start gap-4">
            <LocationIcon />
            <div>
              <div className="font-bold text-brand-dark">Delivery Zones</div>
              <div className="text-sm text-gray-600">Manage 2km radius zones and fees</div>
            </div>
          </Link>
          <Link href="/admin/delivery-zones-map" className="border rounded-lg p-6 hover:bg-red-50 hover:shadow-md transition-all flex items-start gap-4">
            <LocationIcon />
            <div>
              <div className="font-bold text-brand-dark">Zones Map Visualizer</div>
              <div className="text-sm text-gray-600">View zones on Google Maps with test delivery</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
