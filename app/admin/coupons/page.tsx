'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  usedCount: number;
  maxUsesGlobal?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function CouponsAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 0,
    maxUsesGlobal: undefined,
    maxUsesPerUser: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!session?.user?.isPlatformAdmin) {
      router.push('/');
      return;
    }
    fetchCoupons();
  }, [session, router]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderAmount: 0,
          maxUsesGlobal: undefined,
          maxUsesPerUser: 1,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        setShowForm(false);
        fetchCoupons();
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading coupons...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-light py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Coupon Management</h1>
            <p className="text-brand-secondary">Create and manage promotional codes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
          >
            {showForm ? 'Cancel' : '+ Create Coupon'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-brand-accent/20 p-6 mb-8">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Create New Coupon</h2>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., SAVE10"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (KES)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">
                  Min Order Amount (KES)
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-accent/20 rounded focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <button
                type="submit"
                className="md:col-span-2 px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
              >
                Create Coupon
              </button>
            </form>
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white rounded-lg border border-brand-accent/20 overflow-hidden">
          {coupons.length === 0 ? (
            <div className="p-8 text-center text-brand-secondary">
              No coupons yet. Create one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-brand-light border-b border-brand-accent/20">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-brand-dark">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-brand-dark">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-brand-dark">
                      Used
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-brand-dark">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-brand-dark">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-brand-accent/20 hover:bg-brand-light transition-colors"
                    >
                      <td className="px-6 py-3 font-semibold text-brand-dark">{coupon.code}</td>
                      <td className="px-6 py-3 text-sm text-brand-secondary">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : `KES ${coupon.discountValue}`}
                      </td>
                      <td className="px-6 py-3 text-sm text-brand-secondary">
                        {coupon.usedCount}
                        {coupon.maxUsesGlobal && `/${coupon.maxUsesGlobal}`}
                      </td>
                      <td className="px-6 py-3 text-sm text-brand-secondary">
                        {new Date(coupon.endDate).toLocaleDateString('en-KE')}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
