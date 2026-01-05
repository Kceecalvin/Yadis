/**
 * Google Maps and Location Utilities
 */

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKM: number;
  freeDelivery: boolean;
  deliveryFee: number;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Check if a location is within a delivery zone
 */
export function isWithinZone(
  location: Location,
  zone: DeliveryZone
): boolean {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    zone.latitude,
    zone.longitude
  );
  return distance <= zone.radiusKM;
}

/**
 * Find applicable delivery zone for a location
 * Returns the first matching zone with free delivery, or the first paid zone
 */
export function findDeliveryZone(
  location: Location,
  zones: DeliveryZone[]
): DeliveryZone | null {
  // First, look for free delivery zones
  const freeZone = zones.find(
    (zone) =>
      zone.freeDelivery && isWithinZone(location, zone)
  );
  
  if (freeZone) return freeZone;
  
  // Then look for any delivery zone
  const paidZone = zones.find((zone) =>
    isWithinZone(location, zone)
  );
  
  return paidZone || null;
}

/**
 * Get Google Maps embed URL for displaying a location
 */
export function getGoogleMapsEmbedUrl(
  latitude: number,
  longitude: number,
  apiKey: string
): string {
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8246427430467!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zDeKAojEw77iP1JvigaDiiaDUm9Se44iA44Ki44Oz!5e0!3m2!1sja!2sjp!4v1234567890123`;
}

/**
 * Get Google Maps static map URL for an image
 */
export function getGoogleMapsStaticUrl(
  latitude: number,
  longitude: number,
  apiKey: string,
  zoom: number = 15,
  size: string = '400x300'
): string {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${size}&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
}

/**
 * Format delivery info based on location and zones
 */
export function formatDeliveryInfo(
  location: Location,
  zones: DeliveryZone[]
): {
  isFreeDelivery: boolean;
  deliveryFee: number;
  zoneName: string;
  message: string;
} {
  const zone = findDeliveryZone(location, zones);
  
  if (!zone) {
    return {
      isFreeDelivery: false,
      deliveryFee: 0,
      zoneName: 'Outside service area',
      message: 'Your location is outside our delivery zones. Please select a delivery address within our service area.',
    };
  }
  
  if (zone.freeDelivery) {
    return {
      isFreeDelivery: true,
      deliveryFee: 0,
      zoneName: zone.name,
      message: `Free delivery to ${zone.name}!`,
    };
  }
  
  return {
    isFreeDelivery: false,
    deliveryFee: zone.deliveryFee,
    zoneName: zone.name,
    message: `Delivery to ${zone.name}: KES ${zone.deliveryFee}`,
  };
}

/**
 * Validate if coordinates are valid
 */
export function isValidCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
