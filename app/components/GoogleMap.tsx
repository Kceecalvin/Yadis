'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  radius?: number;
  radiusColor?: string;
  markerColor?: string;
  editable?: boolean;
  height?: string;
  showRadius?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleMap({
  latitude,
  longitude,
  zoom = 15,
  onLocationSelect,
  radius,
  radiusColor = '#3b82f6',
  markerColor = 'red',
  editable = false,
  height = '400px',
  showRadius = true,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const marker = useRef<any>(null);
  const circle = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key not configured');
      return;
    }

    // Check if script is already loading or loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script already exists, just wait for it to load
      if (window.google) {
        setMapLoaded(true);
      } else {
        const checkGoogle = setInterval(() => {
          if (window.google) {
            setMapLoaded(true);
            clearInterval(checkGoogle);
          }
        }, 100);
        return () => clearInterval(checkGoogle);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);

    return () => {
      // Don't remove the script - let it persist for other components
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Create map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
        },
      ],
    });

    // Add marker with custom styling for better visibility
    marker.current = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: mapInstance.current,
      draggable: editable,
      title: 'Click and drag me to select your delivery location',
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(50, 50), // Bigger marker
      },
    });

    // Add circle if radius is provided
    if (showRadius && radius) {
      circle.current = new window.google.maps.Circle({
        map: mapInstance.current,
        center: { lat: latitude, lng: longitude },
        radius: radius * 1000, // Convert km to meters
        fillColor: radiusColor,
        fillOpacity: 0.2,
        strokeColor: radiusColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });
    }

    // Handle marker drag
    if (editable) {
      marker.current.addListener('dragend', () => {
        const pos = marker.current.getPosition();
        mapInstance.current.setCenter(pos);

        // Update circle position
        if (circle.current) {
          circle.current.setCenter(pos);
        }

        // Get address from coordinates
        getAddressFromCoordinates(pos.lat(), pos.lng());
      });
    }

    // Handle map click
    if (editable) {
      mapInstance.current.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        marker.current.setPosition({ lat, lng });
        mapInstance.current.setCenter({ lat, lng });

        if (circle.current) {
          circle.current.setCenter({ lat, lng });
        }

        getAddressFromCoordinates(lat, lng);
      });
    }

    return () => {
      // Cleanup
      if (marker.current) marker.current.setMap(null);
      if (circle.current) circle.current.setMap(null);
    };
  }, [mapLoaded, latitude, longitude, zoom, editable, radius, showRadius, radiusColor]);

  // Get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results && result.results[0]) {
        const address = result.results[0].formatted_address;
        onLocationSelect?.(lat, lng, address);
      } else {
        onLocationSelect?.(lat, lng);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      onLocationSelect?.(lat, lng);
    }
  };

  if (error) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Make sure to set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables
          </p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-lg flex items-center justify-center animate-pulse"
      >
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={mapRef}
        style={{ height, borderRadius: '0.5rem' }}
        className="w-full border border-gray-300"
      />
      {editable && (
        <p className="text-xs text-gray-600 mt-2">
          👆 Click anywhere on the map to select your location, or drag the RED marker
        </p>
      )}
    </div>
  );
}
