// Delivery fee calculation logic for YADDPLAST

// Your store location - Exact GPS coordinates
export const STORE_LOCATION = {
  lat: -0.570582,
  lng: 37.315697,
  name: 'YADDPLAST Store - Nduini',
  address: 'Nduini',
};

// Delivery pricing configuration
export const DELIVERY_CONFIG = {
  // Free delivery zone: 0.70 km radius from store
  freeDeliveryRadiusKm: 0.70,
  
  // Paid delivery: ~KES 50 at 1.39km, KES 60 at 2km, KES 70 at 3km, KES 80 at 4km
  // Formula: KES 40 base + KES 10 per km beyond free zone
  baseFee: 4000, // KES 40 in cents (base fee)
  perKmFee: 1000, // KES 10 per km
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Calculate delivery fee based on distance from store
 * @param customerLat - Customer latitude
 * @param customerLng - Customer longitude
 * @returns Object with delivery info
 */
export function calculateDeliveryFee(
  customerLat: number,
  customerLng: number
): {
  distance: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  zone: string;
  message: string;
} {
  // Calculate distance from store to customer
  const distance = calculateDistance(
    STORE_LOCATION.lat,
    STORE_LOCATION.lng,
    customerLat,
    customerLng
  );

  // Check if within free delivery zone (0.70 km)
  if (distance <= DELIVERY_CONFIG.freeDeliveryRadiusKm) {
    return {
      distance,
      deliveryFee: 0,
      isFreeDelivery: true,
      zone: 'Free Delivery Zone',
      message: `🎉 FREE Delivery! You're within ${DELIVERY_CONFIG.freeDeliveryRadiusKm.toFixed(2)} km from our store.`,
    };
  }

  // Calculate paid delivery fee
  // Base KES 40 + KES 10 per km from store, rounded to nearest 10
  // 1.39km ≈ KES 50, 2km = KES 60, 3km = KES 70, 4km = KES 80
  const calculatedFee = DELIVERY_CONFIG.baseFee + (distance * DELIVERY_CONFIG.perKmFee);
  
  // Round to nearest KES 10 (nearest 1000 cents)
  const deliveryFee = Math.round(calculatedFee / 1000) * 1000;

  return {
    distance,
    deliveryFee: deliveryFee,
    isFreeDelivery: false,
    zone: 'Paid Delivery Zone',
    message: `Delivery: KES ${(deliveryFee / 100).toFixed(0)} (${distance.toFixed(2)} km from store)`,
  };
}

/**
 * Format delivery fee for display
 */
export function formatDeliveryFee(feeInCents: number): string {
  if (feeInCents === 0) {
    return 'FREE';
  }
  return `KES ${(feeInCents / 100).toFixed(2)}`;
}

/**
 * Save customer location to database for future reference
 */
export async function saveCustomerLocation(locationData: {
  latitude: number;
  longitude: number;
  address?: string;
  building?: string;
  floor?: string;
  house?: string;
  city?: string;
  notes?: string;
}) {
  const { prisma } = await import('@/lib/db');
  
  const deliveryInfo = calculateDeliveryFee(locationData.latitude, locationData.longitude);
  
  // Check if location already exists
  const existingLocation = await prisma.savedLocation.findUnique({
    where: {
      latitude_longitude: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      },
    },
  });

  if (existingLocation) {
    // Update usage count and last used time
    return await prisma.savedLocation.update({
      where: { id: existingLocation.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
        // Update other details if provided
        address: locationData.address || existingLocation.address,
        building: locationData.building || existingLocation.building,
        floor: locationData.floor || existingLocation.floor,
        house: locationData.house || existingLocation.house,
        city: locationData.city || existingLocation.city,
        notes: locationData.notes || existingLocation.notes,
        distanceKm: deliveryInfo.distance,
        deliveryFee: deliveryInfo.deliveryFee,
      },
    });
  }

  // Create new location
  return await prisma.savedLocation.create({
    data: {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address,
      building: locationData.building,
      floor: locationData.floor,
      house: locationData.house,
      city: locationData.city,
      notes: locationData.notes,
      distanceKm: deliveryInfo.distance,
      deliveryFee: deliveryInfo.deliveryFee,
    },
  });
}

/**
 * Get popular delivery locations (most used)
 */
export async function getPopularLocations(limit: number = 10) {
  const { prisma } = await import('@/lib/db');
  
  return await prisma.savedLocation.findMany({
    orderBy: { usageCount: 'desc' },
    take: limit,
  });
}
