'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';

// Bolt-style map configuration
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Your store location - Exact GPS coordinates
const STORE_LOCATION = {
  lat: -0.570582,
  lng: 37.315697,
  name: 'YADDPLAST Store - Nduini',
};

interface DeliveryLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface BoltStyleMapProps {
  mode: 'select' | 'track'; // select = choose delivery location, track = track delivery
  onLocationSelect?: (location: DeliveryLocation) => void;
  deliveryLocation?: DeliveryLocation;
  riderLocation?: { lat: number; lng: number };
  orderStatus?: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered';
  showRoute?: boolean;
  className?: string;
}

export default function BoltStyleMap({
  mode,
  onLocationSelect,
  deliveryLocation,
  riderLocation,
  orderStatus = 'pending',
  showRoute = true,
  className = '',
}: BoltStyleMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(
    deliveryLocation || null
  );
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(STORE_LOCATION);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation && mode === 'select') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(pos);
          setMapCenter(pos);
        },
        () => {
          console.log('Unable to get location, using default');
        }
      );
    }
  }, [mode]);

  // Calculate distance and ETA
  useEffect(() => {
    if (selectedLocation && mode === 'track') {
      const origin = riderLocation || STORE_LOCATION;
      const destination = selectedLocation;
      
      // Simple distance calculation (haversine formula)
      const R = 6371; // Earth's radius in km
      const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
      const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((origin.lat * Math.PI) / 180) *
          Math.cos((destination.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      
      setDistance(dist);
      // Assume average speed of 30 km/h in city
      setEta(Math.round((dist / 30) * 60)); // minutes
    }
  }, [selectedLocation, riderLocation, mode]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (mode === 'select' && e.latLng) {
        const newLocation = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };
        setSelectedLocation(newLocation);
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
      }
    },
    [mode, onLocationSelect]
  );

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (mode === 'select' && e.latLng) {
        const newLocation = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };
        setSelectedLocation(newLocation);
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
      }
    },
    [mode, onLocationSelect]
  );

  const centerToCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.panTo(currentLocation);
      mapRef.current.setZoom(15);
    }
  };

  const centerToDeliveryLocation = () => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.panTo(selectedLocation);
      mapRef.current.setZoom(15);
    }
  };

  // Route coordinates (straight line for simplicity, use Directions API for real routes)
  const routePath =
    showRoute && selectedLocation
      ? [riderLocation || STORE_LOCATION, selectedLocation]
      : [];

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-600">Error loading maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={mapCenter}
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={onMapClick}
      >
        {/* Store Location Marker */}
        <Marker
          position={STORE_LOCATION}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: 12,
          }}
          label={{
            text: '🏪',
            color: '#ffffff',
            fontSize: '18px',
          }}
          onClick={() => setShowInfoWindow(true)}
        />

        {/* Customer/Delivery Location Marker */}
        {selectedLocation && (
          <Marker
            position={selectedLocation}
            draggable={mode === 'select'}
            onDragEnd={onMarkerDragEnd}
            label={{
              text: '📍',
              fontSize: '28px',
            }}
          />
        )}

        {/* Rider Location Marker (tracking mode) */}
        {mode === 'track' && riderLocation && (
          <Marker
            position={riderLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: 12,
            }}
            label={{
              text: '🏍️',
              color: '#ffffff',
              fontSize: '18px',
            }}
          />
        )}

        {/* Route Polyline */}
        {showRoute && routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}

        {/* Store Info Window */}
        {showInfoWindow && (
          <InfoWindow
            position={STORE_LOCATION}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div className="p-2">
              <h3 className="font-bold text-gray-800">{STORE_LOCATION.name}</h3>
              <p className="text-sm text-gray-600">Kutus Town</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Floating Action Buttons - Bolt Style */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {mode === 'select' && currentLocation && (
          <button
            onClick={centerToCurrentLocation}
            className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            title="My Location"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}

        {mode === 'track' && selectedLocation && (
          <button
            onClick={centerToDeliveryLocation}
            className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            title="Delivery Location"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Info Sheet - Bolt Style */}
      {mode === 'track' && selectedLocation && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 animate-slide-up">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          {/* Order Status */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                orderStatus === 'delivered' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {orderStatus === 'pending' && '🛒'}
                {orderStatus === 'preparing' && '👨‍🍳'}
                {orderStatus === 'ready' && '📦'}
                {orderStatus === 'picked_up' && '🏍️'}
                {orderStatus === 'on_the_way' && '🚀'}
                {orderStatus === 'delivered' && '✅'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">
                  {orderStatus === 'pending' && 'Order Received'}
                  {orderStatus === 'preparing' && 'Preparing Your Order'}
                  {orderStatus === 'ready' && 'Order Ready'}
                  {orderStatus === 'picked_up' && 'Picked Up by Rider'}
                  {orderStatus === 'on_the_way' && 'On The Way'}
                  {orderStatus === 'delivered' && 'Delivered!'}
                </h3>
                {distance !== null && eta !== null && orderStatus === 'on_the_way' && (
                  <p className="text-sm text-gray-600">
                    {distance.toFixed(1)} km away • {eta} min
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>🏪 Store</span>
              <span>🏍️ On Route</span>
              <span>📍 You</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    orderStatus === 'pending' ? 10 :
                    orderStatus === 'preparing' ? 30 :
                    orderStatus === 'ready' ? 50 :
                    orderStatus === 'picked_up' ? 70 :
                    orderStatus === 'on_the_way' ? 90 :
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Delivery Info */}
          {deliveryLocation?.address && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
              <p className="text-sm font-medium text-gray-800">{deliveryLocation.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Location Selection Hint - Bolt Style */}
      {mode === 'select' && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg p-4">
          <p className="text-sm text-gray-700 text-center font-medium">
            📍 {selectedLocation ? 'Drag pin to adjust location' : 'Tap on map to set delivery location'}
          </p>
        </div>
      )}
    </div>
  );
}
