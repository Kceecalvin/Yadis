'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, Circle } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
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

interface BoltStyleMapProProps {
  mode: 'select' | 'track';
  onLocationSelect?: (location: DeliveryLocation) => void;
  deliveryLocation?: DeliveryLocation;
  riderLocation?: { lat: number; lng: number };
  orderStatus?: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered';
  showRoute?: boolean;
  className?: string;
}

export default function BoltStyleMapPro({
  mode,
  onLocationSelect,
  deliveryLocation,
  riderLocation,
  orderStatus = 'pending',
  showRoute = true,
  className = '',
}: BoltStyleMapProProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(
    deliveryLocation || null
  );
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(STORE_LOCATION);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
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
      
      const R = 6371;
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
      setEta(Math.round((dist / 30) * 60));
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

  // Route coordinates
  const routePath =
    showRoute && selectedLocation
      ? [riderLocation || STORE_LOCATION, selectedLocation]
      : [];

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 font-semibold text-lg">Error loading maps</p>
          <p className="text-gray-600 mt-2">Please check your Google Maps API configuration</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  // Store marker icon (SVG as URL)
  const storeIcon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feFlood flood-color="#000000" flood-opacity="0.3"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="24" cy="24" r="20" fill="#10B981" filter="url(#shadow)"/>
        <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff" stroke-width="3"/>
        <path d="M24 14v-2m0 22v-2m10-10h2M12 24h-2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <rect x="18" y="20" width="12" height="8" rx="1" fill="#ffffff"/>
        <rect x="20" y="22" width="3" height="4" fill="#10B981"/>
        <rect x="25" y="22" width="3" height="4" fill="#10B981"/>
      </svg>
    `)}`,
    scaledSize: isLoaded ? new google.maps.Size(48, 48) : undefined,
    anchor: isLoaded ? new google.maps.Point(24, 24) : undefined,
  };

  // Delivery pin icon
  const deliveryIcon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="3" result="offsetblur"/>
            <feFlood flood-color="#000000" flood-opacity="0.4"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M20 0C11.716 0 5 6.716 5 15c0 11.25 15 35 15 35s15-23.75 15-35c0-8.284-6.716-15-15-15z" 
          fill="#EF4444" filter="url(#pin-shadow)"/>
        <path d="M20 0C11.716 0 5 6.716 5 15c0 11.25 15 35 15 35s15-23.75 15-35c0-8.284-6.716-15-15-15z" 
          fill="none" stroke="#ffffff" stroke-width="2"/>
        <circle cx="20" cy="15" r="6" fill="#ffffff"/>
        <circle cx="20" cy="15" r="3" fill="#EF4444"/>
      </svg>
    `)}`,
    scaledSize: isLoaded ? new google.maps.Size(40, 52) : undefined,
    anchor: isLoaded ? new google.maps.Point(20, 52) : undefined,
  };

  // Rider icon
  const riderIcon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="rider-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feFlood flood-color="#000000" flood-opacity="0.3"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="24" cy="24" r="20" fill="#3B82F6" filter="url(#rider-shadow)"/>
        <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff" stroke-width="3"/>
        <path d="M24 16l-6 8h5v8l6-8h-5v-8z" fill="#ffffff"/>
      </svg>
    `)}`,
    scaledSize: isLoaded ? new google.maps.Size(48, 48) : undefined,
    anchor: isLoaded ? new google.maps.Point(24, 24) : undefined,
  };

  const getStatusConfig = () => {
    switch (orderStatus) {
      case 'pending':
        return { icon: '🛒', text: 'Order Received', color: 'blue', progress: 10 };
      case 'preparing':
        return { icon: '👨‍🍳', text: 'Preparing Your Order', color: 'yellow', progress: 30 };
      case 'ready':
        return { icon: '📦', text: 'Order Ready', color: 'orange', progress: 50 };
      case 'picked_up':
        return { icon: '🏍️', text: 'Picked Up by Rider', color: 'indigo', progress: 70 };
      case 'on_the_way':
        return { icon: '🚀', text: 'On The Way', color: 'purple', progress: 90 };
      case 'delivered':
        return { icon: '✅', text: 'Delivered!', color: 'green', progress: 100 };
      default:
        return { icon: '🛒', text: 'Processing', color: 'gray', progress: 0 };
    }
  };

  const status = getStatusConfig();

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
        {/* Store Marker */}
        <Marker
          position={STORE_LOCATION}
          icon={storeIcon}
          zIndex={100}
          onMouseOver={() => setHoveredMarker('store')}
          onMouseOut={() => setHoveredMarker(null)}
        />

        {/* Store radius circle */}
        <Circle
          center={STORE_LOCATION}
          radius={50}
          options={{
            fillColor: '#10B981',
            fillOpacity: 0.1,
            strokeColor: '#10B981',
            strokeOpacity: 0.3,
            strokeWeight: 1,
          }}
        />

        {/* Delivery Location Marker */}
        {selectedLocation && (
          <>
            <Marker
              position={selectedLocation}
              draggable={mode === 'select'}
              onDragEnd={onMarkerDragEnd}
              icon={deliveryIcon}
              zIndex={90}
              onMouseOver={() => setHoveredMarker('delivery')}
              onMouseOut={() => setHoveredMarker(null)}
              animation={mode === 'select' && isLoaded ? google.maps.Animation.DROP : undefined}
            />
            {/* Delivery radius */}
            <Circle
              center={selectedLocation}
              radius={30}
              options={{
                fillColor: '#EF4444',
                fillOpacity: 0.1,
                strokeColor: '#EF4444',
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {/* Rider Marker */}
        {mode === 'track' && riderLocation && (
          <>
            <Marker
              position={riderLocation}
              icon={riderIcon}
              zIndex={110}
              onMouseOver={() => setHoveredMarker('rider')}
              onMouseOut={() => setHoveredMarker(null)}
            />
            {/* Rider radius */}
            <Circle
              center={riderLocation}
              radius={40}
              options={{
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                strokeColor: '#3B82F6',
                strokeOpacity: 0.4,
                strokeWeight: 2,
              }}
            />
          </>
        )}

        {/* Route Polyline */}
        {showRoute && routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 5,
              geodesic: true,
              icons: isLoaded ? [
                {
                  icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    strokeColor: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 1,
                  },
                  offset: '100%',
                },
              ] : undefined,
            }}
          />
        )}
      </GoogleMap>

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {mode === 'select' && currentLocation && (
          <button
            onClick={centerToCurrentLocation}
            className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 group"
            title="My Location"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition-colors"
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
            className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 group"
            title="Delivery Location"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700 group-hover:text-red-600 transition-colors"
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

      {/* Bottom Info Sheet - Track Mode */}
      {mode === 'track' && selectedLocation && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 animate-slide-up">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
          
          {/* Status Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
              status.color === 'green' ? 'from-green-400 to-green-600' :
              status.color === 'blue' ? 'from-blue-400 to-blue-600' :
              status.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
              status.color === 'orange' ? 'from-orange-400 to-orange-600' :
              status.color === 'indigo' ? 'from-indigo-400 to-indigo-600' :
              status.color === 'purple' ? 'from-purple-400 to-purple-600' :
              'from-gray-400 to-gray-600'
            } shadow-lg`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900">{status.text}</h3>
              {distance !== null && eta !== null && orderStatus === 'on_the_way' && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">{distance.toFixed(1)} km</span> away • 
                  <span className="font-semibold"> {eta} min</span> estimated
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
              <span>Store</span>
              <span>En Route</span>
              <span>You</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                  status.color === 'green' ? 'from-green-400 to-green-600' :
                  'from-blue-400 to-blue-600'
                }`}
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>
            <div className="text-right text-xs font-semibold text-gray-600 mt-1">
              {status.progress}%
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryLocation?.address && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
              <p className="text-sm font-medium text-gray-900">{deliveryLocation.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Location Selection Hint */}
      {mode === 'select' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-full shadow-lg px-6 py-3 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              {selectedLocation ? 'Drag pin to adjust location' : 'Tap on map to set delivery location'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
