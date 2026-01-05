'use client';

import { useState } from 'react';
import BoltStyleMapPro from '@/app/components/BoltStyleMapPro';

export default function MapDemoPage() {
  const [mode, setMode] = useState<'select' | 'track'>('select');
  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  const [orderStatus, setOrderStatus] = useState<
    'pending' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered'
  >('pending');
  
  // Simulated rider location (moving towards delivery)
  const [riderLocation] = useState({
    lat: -0.5962113885867295,
    lng: 37.271849811578356,
  });

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setDeliveryLocation({
      ...location,
      address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
    });
  };

  const simulateDelivery = () => {
    setMode('track');
    const statuses: typeof orderStatus[] = [
      'pending',
      'preparing',
      'ready',
      'picked_up',
      'on_the_way',
      'delivered',
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex >= statuses.length) {
        clearInterval(interval);
        return;
      }
      setOrderStatus(statuses[currentIndex]);
    }, 3000); // Change status every 3 seconds
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Interactive Delivery Tracking</h1>
          <p className="text-gray-600 mt-2">Professional map system for seamless delivery experience</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setMode('select')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  mode === 'select'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Select Location
              </button>
              <button
                onClick={() => setMode('track')}
                disabled={!deliveryLocation}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  mode === 'track'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Track Delivery
              </button>
            </div>

            {deliveryLocation && mode === 'track' && (
              <button
                onClick={simulateDelivery}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Simulate Delivery
              </button>
            )}
          </div>

          {deliveryLocation && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Selected Location</p>
                  <p className="text-sm font-mono text-blue-900">
                    {deliveryLocation.lat.toFixed(6)}, {deliveryLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200" style={{ height: '600px' }}>
          <BoltStyleMapPro
            mode={mode}
            onLocationSelect={handleLocationSelect}
            deliveryLocation={deliveryLocation || undefined}
            riderLocation={mode === 'track' ? riderLocation : undefined}
            orderStatus={orderStatus}
            showRoute={mode === 'track'}
          />
        </div>

        {/* Features List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-bold text-gray-800 mb-1">Interactive Pin</h3>
            <p className="text-sm text-gray-600">
              Click or drag the pin to select your exact delivery location
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">🗺️</div>
            <h3 className="font-bold text-gray-800 mb-1">Live Tracking</h3>
            <p className="text-sm text-gray-600">
              See real-time rider location and estimated delivery time
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-gray-800 mb-1">Status Updates</h3>
            <p className="text-sm text-gray-600">
              Track your order from preparation to delivery
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-bold text-gray-800 mb-1">Accurate Distance</h3>
            <p className="text-sm text-gray-600">
              Real-time distance calculation and ETA estimation
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">🏍️</div>
            <h3 className="font-bold text-gray-800 mb-1">Route Visualization</h3>
            <p className="text-sm text-gray-600">
              See the delivery route from store to your location
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-bold text-gray-800 mb-1">Bolt-Style UI</h3>
            <p className="text-sm text-gray-600">
              Modern, clean design with smooth animations
            </p>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 How to Use in Your App</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">1. Location Selection (Checkout)</h3>
              <pre className="bg-white p-3 rounded border border-gray-300 text-sm overflow-x-auto">
{`<BoltStyleMap
  mode="select"
  onLocationSelect={(location) => {
    setDeliveryAddress(location);
  }}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">2. Delivery Tracking (Order Page)</h3>
              <pre className="bg-white p-3 rounded border border-gray-300 text-sm overflow-x-auto">
{`<BoltStyleMap
  mode="track"
  deliveryLocation={order.deliveryLocation}
  riderLocation={rider.currentLocation}
  orderStatus={order.status}
  showRoute={true}
/>`}
              </pre>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">✨ Features:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Draggable location pin</li>
              <li>✅ Current location detection</li>
              <li>✅ Real-time rider tracking</li>
              <li>✅ Distance & ETA calculation</li>
              <li>✅ Order status visualization</li>
              <li>✅ Route polyline display</li>
              <li>✅ Floating action buttons</li>
              <li>✅ Bottom sheet info panel</li>
              <li>✅ Smooth animations</li>
              <li>✅ Mobile responsive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
