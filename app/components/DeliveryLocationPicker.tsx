'use client';

import { useEffect, useState } from 'react';
import GoogleMap from './GoogleMap';
import { formatDeliveryInfo, calculateDistance } from '@/lib/maps';
import { useGeolocation } from '@/app/hooks/useGeolocation';

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKM: number;
  freeDelivery: boolean;
  deliveryFee: number;
}

interface DeliveryLocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    deliveryFee: number;
    isFreeDelivery: boolean;
    zone: string;
  }) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export default function DeliveryLocationPicker({
  onLocationSelect,
  defaultLat = -0.6838,
  defaultLng = 37.2675,
}: DeliveryLocationPickerProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Geolocation hook
  const { coordinates, loading: geoLoading, error: geoError, requestLocation, clearError, isSupported } = useGeolocation();

  // Fetch delivery zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch('/api/admin/delivery-zones');
        if (response.ok) {
          const data = await response.json();
          setZones(data);
        }
      } catch (error) {
        console.error('Error fetching zones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  // When geolocation coordinates are received, auto-select that location
  useEffect(() => {
    if (coordinates) {
      handleLocationSelect(coordinates.latitude, coordinates.longitude, 'Your Current Location');
    }
  }, [coordinates]);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    const location = {
      lat,
      lng,
      address: address || 'Selected Location',
    };
    setSelectedLocation(location);

    // Calculate delivery info
    const info = formatDeliveryInfo({ latitude: lat, longitude: lng }, zones);
    setDeliveryInfo(info);

    // Callback
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address: location.address,
      deliveryFee: info.deliveryFee,
      isFreeDelivery: info.isFreeDelivery,
      zone: info.zoneName,
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center animate-pulse">
        <div className="text-gray-600">Loading delivery map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Geolocation Error Alert - Hidden, location is optional */}
      {geoError && false && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold text-red-800">Location Error</p>
              <p className="text-sm text-red-700 mt-1">{geoError}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-semibold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Map with Use Location Button */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Button Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-4 flex gap-3">
          {isSupported && (
            <button
              onClick={requestLocation}
              disabled={geoLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-sm transition-all ${
                geoLoading
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : coordinates
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {geoLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting location...
                </>
              ) : coordinates ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Location Found
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Use My Location
                </>
              )}
            </button>
          )}
          <p className="flex items-center text-xs text-gray-600">
            {isSupported ? 'Share your location to auto-center map' : 'Geolocation not supported'}
          </p>
        </div>

        {/* Map */}
        <GoogleMap
          latitude={coordinates?.latitude || selectedLocation?.lat || defaultLat}
          longitude={coordinates?.longitude || selectedLocation?.lng || defaultLng}
          zoom={14}
          height="450px"
          onLocationSelect={handleLocationSelect}
          editable={true}
          showRadius={true}
          radiusColor="#10b981"
        />
      </div>

      {/* Location Info */}
      {selectedLocation && deliveryInfo && (
        <div className="space-y-4">
          {/* Address */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Delivery Address</p>
            <p className="font-semibold text-brand-dark">{selectedLocation.address}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </p>
          </div>

          {/* Delivery Cost */}
          <div
            className={`p-4 rounded-lg border-2 ${
              deliveryInfo.isFreeDelivery
                ? 'bg-green-50 border-green-300'
                : 'bg-blue-50 border-blue-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">Delivery Cost</p>
                <p className={`text-2xl font-bold ${deliveryInfo.isFreeDelivery ? 'text-green-600' : 'text-blue-600'}`}>
                  {deliveryInfo.isFreeDelivery ? 'FREE' : `KES ${deliveryInfo.deliveryFee}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Service Zone</p>
                <p className="font-semibold text-gray-700">{deliveryInfo.zoneName}</p>
              </div>
            </div>
            {deliveryInfo.isFreeDelivery && (
              <p className="text-sm text-green-700 mt-3">
                Lucky you! Free delivery applies to this area!
              </p>
            )}
          </div>

          {/* Zone Coverage */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-3 font-semibold">Coverage in Service Zones</p>
            <div className="space-y-2">
              {zones.map((zone) => {
                const distance = calculateDistance(
                  selectedLocation.lat,
                  selectedLocation.lng,
                  zone.latitude,
                  zone.longitude
                );
                const withinZone = distance <= zone.radiusKM;

                return (
                  <div
                    key={zone.id}
                    className={`p-3 rounded border ${
                      withinZone
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">{zone.name}</span>
                      <span className={withinZone ? 'text-green-600 font-bold text-sm' : 'text-gray-500 text-sm'}>
                        {distance.toFixed(2)}km
                      </span>
                    </div>
                    {withinZone && (
                      <div className="text-sm font-bold mt-2">
                        {zone.freeDelivery ? (
                          <span className="text-green-600">✓ Free Delivery</span>
                        ) : (
                          <span className="text-blue-600">✓ KES {zone.deliveryFee}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              Drag the marker or click on the map to adjust your delivery location. The delivery cost will update automatically.
            </p>
          </div>
        </div>
      )}

      {!selectedLocation && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800 font-semibold">Click or drag the marker on the map to select your delivery location</p>
        </div>
      )}
    </div>
  );
}
