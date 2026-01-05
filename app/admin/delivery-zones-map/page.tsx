'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GoogleMap from '@/app/components/GoogleMap';
import LoadingScreen from '@/components/LoadingScreen';
import { calculateDistance, isWithinZone, formatDeliveryInfo } from '@/lib/maps';

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKM: number;
  freeDelivery: boolean;
  deliveryFee: number;
}

interface TestLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export default function DeliveryZonesMapPage() {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [testLocation, setTestLocation] = useState<TestLocation | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'test'>('overview');

  // Sample Nairobi coordinates
  const nairobiCenter = { lat: -1.2865, lng: 36.8172 };

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/delivery-zones');
      if (response.ok) {
        const data = await response.json();
        setZones(data);
        if (data.length > 0) {
          setSelectedZone(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLocation = (lat: number, lng: number, address?: string) => {
    const location = { latitude: lat, longitude: lng, address: address || 'Selected Location' };
    setTestLocation(location);

    // Calculate delivery info
    const info = formatDeliveryInfo(location, zones);
    setDeliveryInfo(info);
  };

  const calculateDistanceToZone = (zone: Zone) => {
    if (!testLocation) return null;
    return calculateDistance(
      testLocation.latitude,
      testLocation.longitude,
      zone.latitude,
      zone.longitude
    ).toFixed(2);
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Delivery Zones Map"
        message="Initializing Google Maps..."
        steps={['Loading zones', 'Initializing map', 'Ready']}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Delivery Zones Map</h1>
        <p className="text-gray-600">Visualize delivery zones with 2km radius coverage</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          All Zones Map
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'test'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Test Delivery
        </button>
      </div>

      {/* Overview Tab - All Zones */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Map */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <GoogleMap
                latitude={nairobiCenter.lat}
                longitude={nairobiCenter.lng}
                zoom={12}
                height="500px"
                showRadius={true}
                radiusColor="#3b82f6"
              />
            </div>
          </div>

          {/* Zones List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-dark">Active Zones</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedZone?.id === zone.id
                      ? 'border-brand-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-bold text-brand-dark">{zone.name}</h3>
                  <div className="text-xs text-gray-600 space-y-1 mt-2">
                    <p>Radius: {zone.radiusKM}km</p>
                    <p className="font-mono">
                      {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                    </p>
                    <p className="text-orange-600 font-bold">KES {zone.deliveryFee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Delivery Tab */}
      {activeTab === 'test' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Test Map */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <GoogleMap
                  latitude={testLocation?.latitude || nairobiCenter.lat}
                  longitude={testLocation?.longitude || nairobiCenter.lng}
                  zoom={14}
                  height="500px"
                  onLocationSelect={handleTestLocation}
                  editable={true}
                  showRadius={true}
                  radiusColor="#ef4444"
                />
              </div>
            </div>

            {/* Test Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-brand-dark">Delivery Info</h2>

              {testLocation && deliveryInfo ? (
                <div className="space-y-4">
                  {/* Location */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Selected Location</p>
                    <p className="font-semibold text-brand-dark text-sm">{testLocation.address}</p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      {testLocation.latitude.toFixed(4)}, {testLocation.longitude.toFixed(4)}
                    </p>
                  </div>

                  {/* Delivery Status */}
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      deliveryInfo.isFreeDelivery
                        ? 'bg-green-50 border-green-300'
                        : 'bg-orange-50 border-orange-300'
                    }`}
                  >
                    <p className="text-xs text-gray-600 mb-1">Delivery Status</p>
                    <p className={`font-bold text-lg ${deliveryInfo.isFreeDelivery ? 'text-green-600' : 'text-orange-600'}`}>
                      {deliveryInfo.isFreeDelivery ? 'FREE DELIVERY' : `KES ${deliveryInfo.deliveryFee}`}
                    </p>
                    <p className="text-sm mt-2 text-gray-700">{deliveryInfo.message}</p>
                    <p className="text-xs text-gray-600 mt-2">Zone: {deliveryInfo.zoneName}</p>
                  </div>

                  {/* Distance to Zones */}
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600 mb-3 font-semibold">Distance to Zones</p>
                    <div className="space-y-2 text-xs">
                      {zones.map((zone) => {
                        const distance = calculateDistanceToZone(zone);
                        const withinZone = distance && parseFloat(distance) <= zone.radiusKM;
                        return (
                          <div
                            key={zone.id}
                            className={`p-2 rounded ${
                              withinZone
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-700">{zone.name}</span>
                              <span className={withinZone ? 'text-green-600 font-bold' : 'text-gray-600'}>
                                {distance}km
                              </span>
                            </div>
                            {withinZone && (
                              <div className="text-green-600 font-semibold mt-1">
                                Charge: KES {zone.deliveryFee}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Click or drag the marker on the map to test delivery availability for any location
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Zone Details */}
          {testLocation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">Zone Coverage Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Zone Name</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Radius</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Distance</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Within Zone</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => {
                      const distance = calculateDistanceToZone(zone);
                      const withinZone = distance && parseFloat(distance) <= zone.radiusKM;
                      return (
                        <tr key={zone.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{zone.name}</td>
                          <td className="px-4 py-3 text-center">{zone.radiusKM}km</td>
                          <td className="px-4 py-3 text-center font-mono">{distance}km</td>
                          <td className="px-4 py-3 text-center">
                            {withinZone ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                                Yes
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-orange-600 font-bold">KES {zone.deliveryFee}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
