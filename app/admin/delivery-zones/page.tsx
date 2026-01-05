'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface DeliveryZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKM: number;
  freeDelivery: boolean;
  deliveryFee: number;
  estimatedTime: number;
  active: boolean;
  createdAt: string;
}

interface DeliveryStats {
  totalZones: number;
  freeDeliveryZones: number;
  paidDeliveryZones: number;
  avgDeliveryTime: number;
}

export default function DeliveryZonesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [activeTab, setActiveTab] = useState<'zones' | 'add' | 'settings'>('zones');
  const [updating, setUpdating] = useState(false);

  // Add Zone Form
  const [newZone, setNewZone] = useState({
    name: '',
    latitude: -1.2865,
    longitude: 36.8172,
    radiusKM: 2,
    freeDelivery: true,
    deliveryFee: 50,
    estimatedTime: 30,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [zonesRes, statsRes] = await Promise.all([
        fetch('/api/admin/delivery-zones'),
        fetch('/api/admin/delivery-zones/stats'),
      ]);

      if (zonesRes.ok) {
        const zonesData = await zonesRes.json();
        setZones(zonesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async () => {
    if (!newZone.name || newZone.latitude === 0 || newZone.longitude === 0) {
      setError('Please fill all zone fields');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/delivery-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZone),
      });

      if (!response.ok) throw new Error('Failed to add delivery zone');
      setSuccessMessage('Delivery zone added successfully!');
      setNewZone({
        name: '',
        latitude: -1.2865,
        longitude: 36.8172,
        radiusKM: 2,
        freeDelivery: true,
        deliveryFee: 50,
        estimatedTime: 30,
      });
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add zone');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/delivery-zones/${zoneId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete zone');
      setSuccessMessage('Zone deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete zone');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Delivery Zones"
        message="Retrieving delivery areas and zones..."
        steps={['Fetching zones', 'Loading statistics', 'Ready']}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Delivery Zones Management</h1>
        <p className="text-gray-600">Set up delivery areas and manage zones</p>
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

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalZones}</div>
            <div className="text-gray-600 text-sm">Total Zones</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600 mb-1">{stats.paidDeliveryZones}</div>
            <div className="text-gray-600 text-sm">Paid Delivery</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.avgDeliveryTime}m</div>
            <div className="text-gray-600 text-sm">Avg Delivery Time</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'zones'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Active Zones
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'add'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Add New Zone
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Radius Settings
        </button>
      </div>

      {/* Active Zones Tab */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Active Delivery Zones</h2>

          {zones.length === 0 ? (
            <p className="text-gray-600">No zones configured yet</p>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div key={zone.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-brand-dark">{zone.name}</h3>
                      <p className="text-sm text-gray-600">
                        Coordinates: {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Radius</p>
                      <p className="font-bold text-blue-600">{zone.radiusKM} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Est. Delivery Time</p>
                      <p className="font-bold text-purple-600">{zone.estimatedTime} min</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded">
                    <div>
                      <span className="text-xs text-orange-600">Delivery Fee: KES {zone.deliveryFee}</span>
                      <p className="font-bold text-lg">
                        {zone.freeDelivery ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-orange-600">No</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Delivery Fee (if paid)</span>
                      <p className="font-bold text-lg text-green-600">KES {zone.deliveryFee}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Status</span>
                      <p className="font-bold text-lg">
                        {zone.active ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-600">Inactive</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete Zone
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Zone Tab */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Add New Delivery Zone</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zone Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Nairobi CBD"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={newZone.latitude}
                  onChange={(e) => setNewZone({ ...newZone, latitude: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Default: Nairobi center (-1.2865)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={newZone.longitude}
                  onChange={(e) => setNewZone({ ...newZone, longitude: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Default: Nairobi center (36.8172)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Radius (KM)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={newZone.radiusKM}
                  onChange={(e) => setNewZone({ ...newZone, radiusKM: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Radius in kilometers</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newZone.freeDelivery}
                    onChange={(e) => setNewZone({ ...newZone, freeDelivery: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-gray-700">Delivery Fee Configuration</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Fee (if not free)
                </label>
                <input
                  type="number"
                  value={newZone.deliveryFee}
                  onChange={(e) => setNewZone({ ...newZone, deliveryFee: parseInt(e.target.value) })}
                  disabled={newZone.freeDelivery}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Delivery Time (minutes)
                </label>
                <input
                  type="number"
                  value={newZone.estimatedTime}
                  onChange={(e) => setNewZone({ ...newZone, estimatedTime: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">How to set coordinates</h3>
                <p className="text-sm text-blue-800">
                  Use Google Maps to find latitude and longitude of your zone center point
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddZone}
            disabled={updating}
            className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {updating ? 'Adding...' : 'Add Delivery Zone'}
          </button>
        </div>
      )}

      {/* Radius Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Delivery Zones Configuration</h2>

          <div className="space-y-8">
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4">How Delivery Zones Work</h3>
              <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                <li>Customer enters delivery address or pins location on map</li>
                <li>System calculates distance from zone center</li>
                <li>If distance is within 2km radius: Free delivery applied</li>
                <li>If distance exceeds 2km: Delivery fee charged</li>
                <li>Customer sees delivery fee before checkout</li>
                <li>Order created with delivery fee applied</li>
              </ol>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Distance Calculation</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  Uses Haversine formula to calculate accurate distance between two GPS coordinates
                </p>
                <div className="p-3 bg-white rounded border border-blue-200 font-mono text-xs">
                  distance = 2 * R * arcsin(sqrt(sin²((lat2-lat1)/2) + cos(lat1) * cos(lat2) * sin²((lon2-lon1)/2)))
                </div>
                <p>R (Earth radius) = 6,371 km</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-300">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Current Configuration</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-purple-800">
                <div>
                  <p className="font-bold">Delivery Zone Radius</p>
                  <p className="text-2xl font-bold text-purple-600">2 km</p>
                </div>
                <div>
                  <p className="font-bold">Active Zones</p>
                  <p className="text-2xl font-bold text-purple-600">{zones.length}</p>
                </div>
                <div>
                  <p className="font-bold">Active Delivery Zones</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {zones.filter(z => z.freeDelivery).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-amber-50 border border-amber-300 rounded-lg">
              <h3 className="font-bold text-amber-900 mb-3">Setup Steps</h3>
              <ol className="text-sm text-amber-900 space-y-2 list-decimal list-inside">
                <li>Click "Add New Zone" tab</li>
                <li>Enter zone name (e.g., "Nairobi CBD")</li>
                <li>Set latitude and longitude of zone center</li>
                <li>Set radius for coverage area</li>
                <li>Click "Add Delivery Zone"</li>
                <li>Zone is now active and delivery fees apply</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
