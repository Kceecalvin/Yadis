# 🗺️ Bolt-Style Map System - Complete Guide

## Overview

A professional, interactive map system inspired by Bolt/Uber for your food & household delivery business. Provides seamless location selection and real-time delivery tracking.

---

## 🎯 Features

### 1. **Interactive Location Selection**
- **Tap to Place**: Click anywhere on map to set delivery location
- **Drag to Adjust**: Draggable pin for precise positioning
- **Current Location**: Auto-detect user's GPS location
- **Visual Feedback**: Clear markers and hints

### 2. **Real-Time Delivery Tracking**
- **Live Rider Location**: See where your delivery person is
- **Route Visualization**: Blue line showing delivery route
- **Distance & ETA**: Real-time distance and estimated arrival time
- **Status Updates**: Visual progress from store to your door

### 3. **Bolt-Style UI/UX**
- **Bottom Sheet**: Sliding info panel with order details
- **Floating Buttons**: Quick access to location controls
- **Progress Bar**: Visual order status progression
- **Smooth Animations**: Professional slide-up effects
- **Clean Design**: Minimal, modern interface

### 4. **Custom Markers**
- 🏪 **Store** - Green circle with store icon
- 📍 **Delivery** - Red location pin (draggable)
- 🏍️ **Rider** - Blue circle with motorcycle icon

---

## 🚀 Quick Start

### Test the Map Demo

```bash
# Server is already running on http://localhost:3001
# Open in browser:
http://localhost:3001/map-demo
```

**Try These Actions:**
1. Click "Select Location" button
2. Click anywhere on the map → Pin appears
3. Drag the red pin to adjust location
4. Click "Track Delivery" button
5. Click "Simulate Delivery" → Watch the animation!

---

## 📦 Component Usage

### Mode 1: Location Selection (Checkout)

Use this during checkout to let customers select their delivery address:

```tsx
import BoltStyleMap from '@/app/components/BoltStyleMap';

function CheckoutPage() {
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  return (
    <div style={{ height: '500px' }}>
      <BoltStyleMap
        mode="select"
        onLocationSelect={(location) => {
          setDeliveryLocation(location);
          console.log('Selected:', location);
          // Save to form: lat, lng
        }}
      />
    </div>
  );
}
```

### Mode 2: Delivery Tracking (Order Page)

Use this on order tracking page to show live delivery status:

```tsx
import BoltStyleMap from '@/app/components/BoltStyleMap';

function OrderTrackingPage({ order }) {
  const [riderLocation, setRiderLocation] = useState(null);

  // Poll rider location every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const rider = await fetchRiderLocation(order.id);
      setRiderLocation(rider.location);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [order.id]);

  return (
    <div style={{ height: '600px' }}>
      <BoltStyleMap
        mode="track"
        deliveryLocation={{
          lat: order.deliveryLatitude,
          lng: order.deliveryLongitude,
          address: order.deliveryAddress,
        }}
        riderLocation={riderLocation}
        orderStatus={order.status}
        showRoute={true}
      />
    </div>
  );
}
```

---

## 🎨 Component Props

### BoltStyleMap Props

```typescript
interface BoltStyleMapProps {
  // Map mode
  mode: 'select' | 'track';
  
  // Location selection callback (select mode)
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
  }) => void;
  
  // Delivery location (both modes)
  deliveryLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  
  // Rider location (track mode)
  riderLocation?: {
    lat: number;
    lng: number;
  };
  
  // Order status (track mode)
  orderStatus?: 
    | 'pending'
    | 'preparing'
    | 'ready'
    | 'picked_up'
    | 'on_the_way'
    | 'delivered';
  
  // Show route line (track mode)
  showRoute?: boolean;
  
  // Custom CSS class
  className?: string;
}
```

---

## 🔧 Integration Steps

### Step 1: Add to Checkout Page

Update your checkout page to use the new map:

```tsx
// app/checkout/page.tsx

import BoltStyleMap from '@/app/components/BoltStyleMap';

export default function CheckoutPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    // Update form fields
    setFormData({
      ...formData,
      deliveryLatitude: location.lat,
      deliveryLongitude: location.lng,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Delivery Location
        </label>
        <div style={{ height: '400px' }}>
          <BoltStyleMap
            mode="select"
            onLocationSelect={handleLocationSelect}
            deliveryLocation={selectedLocation}
          />
        </div>
      </div>

      {/* Submit button */}
    </form>
  );
}
```

### Step 2: Create Order Tracking Page

Create a new page for order tracking:

```tsx
// app/orders/[id]/track/page.tsx

import BoltStyleMap from '@/app/components/BoltStyleMap';

export default async function OrderTrackingPage({ params }) {
  const order = await getOrder(params.id);

  return (
    <div className="min-h-screen">
      <div style={{ height: '100vh' }}>
        <BoltStyleMap
          mode="track"
          deliveryLocation={{
            lat: order.deliveryLatitude,
            lng: order.deliveryLongitude,
            address: order.deliveryAddress,
          }}
          riderLocation={order.rider?.currentLocation}
          orderStatus={order.status}
          showRoute={true}
        />
      </div>
    </div>
  );
}
```

### Step 3: Add Real-Time Updates (Optional)

For live tracking, implement WebSocket or polling:

```tsx
// Using polling (simple approach)
useEffect(() => {
  const fetchRiderLocation = async () => {
    const response = await fetch(`/api/orders/${orderId}/rider-location`);
    const data = await response.json();
    setRiderLocation(data.location);
    setOrderStatus(data.status);
  };

  // Poll every 5 seconds
  const interval = setInterval(fetchRiderLocation, 5000);
  
  return () => clearInterval(interval);
}, [orderId]);
```

```tsx
// Using WebSockets (advanced approach)
useEffect(() => {
  const ws = new WebSocket(`wss://your-server.com/orders/${orderId}`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setRiderLocation(data.riderLocation);
    setOrderStatus(data.status);
  };

  return () => ws.close();
}, [orderId]);
```

---

## 🎯 Order Status Flow

The map visualizes these order statuses:

```
1. pending     → 🛒 Order Received      (10% progress)
2. preparing   → 👨‍🍳 Preparing Your Order (30% progress)
3. ready       → 📦 Order Ready          (50% progress)
4. picked_up   → 🏍️ Picked Up by Rider  (70% progress)
5. on_the_way  → 🚀 On The Way          (90% progress)
6. delivered   → ✅ Delivered!           (100% progress)
```

---

## 📱 Mobile Responsive

The map is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

**Key Features:**
- Touch-friendly draggable pins
- Responsive bottom sheet
- Adaptive button sizes
- Optimized for all screen sizes

---

## 🎨 Customization

### Change Store Location

Edit the constant in `BoltStyleMap.tsx`:

```tsx
const STORE_LOCATION = {
  lat: -0.6838,  // Your store latitude
  lng: 37.2675,  // Your store longitude
  name: 'Your Store Name',
};
```

### Customize Marker Icons

The markers use SVG for sharp, scalable icons:

```tsx
// Store marker (green)
icon={{
  url: 'data:image/svg+xml;base64,' + btoa(`
    <svg><!-- Your custom icon --></svg>
  `),
}}

// Delivery marker (red pin)
// Rider marker (blue)
```

### Change Map Style

Modify `mapOptions` to customize the map appearance:

```tsx
const mapOptions = {
  styles: [
    // Add custom map styles here
    // Use: https://mapstyle.withgoogle.com/
  ],
};
```

---

## 🚀 Advanced Features

### 1. Add Address Search

Integrate Google Places Autocomplete:

```tsx
import { Autocomplete } from '@react-google-maps/api';

function AddressSearch({ onSelect }) {
  const [autocomplete, setAutocomplete] = useState(null);

  const onLoad = (auto) => setAutocomplete(auto);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      onSelect(location);
    }
  };

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        placeholder="Search address..."
        className="w-full p-3 border rounded-lg"
      />
    </Autocomplete>
  );
}
```

### 2. Calculate Delivery Fee by Distance

```tsx
function calculateDeliveryFee(distance: number) {
  if (distance < 2) return 0; // Free delivery < 2km
  if (distance < 5) return 50; // KES 50 for 2-5km
  if (distance < 10) return 100; // KES 100 for 5-10km
  return Math.ceil(distance * 15); // KES 15 per km > 10km
}
```

### 3. Add Multiple Stops

For deliveries with multiple stops:

```tsx
const stops = [
  { lat: -0.6838, lng: 37.2675, name: 'Store' },
  { lat: -0.6850, lng: 37.2680, name: 'Customer 1' },
  { lat: -0.6860, lng: 37.2690, name: 'Customer 2' },
];

<Polyline
  path={stops}
  options={{ strokeColor: '#3B82F6' }}
/>
```

---

## 🐛 Troubleshooting

### Map Not Loading

**Problem**: Blank map or loading forever

**Solutions**:
1. Check Google Maps API key is correct
2. Enable required APIs:
   - Maps JavaScript API
   - Geocoding API (for address search)
   - Directions API (for routes)
3. Check browser console for errors

### Location Detection Not Working

**Problem**: Current location button doesn't work

**Solutions**:
1. Enable location permissions in browser
2. Use HTTPS (geolocation requires secure origin)
3. Check browser compatibility

### Markers Not Appearing

**Problem**: Pins don't show on map

**Solutions**:
1. Check lat/lng values are valid numbers
2. Verify coordinates are within map bounds
3. Check console for SVG encoding errors

---

## 📊 Performance Tips

### 1. Lazy Load the Map

```tsx
import dynamic from 'next/dynamic';

const BoltStyleMap = dynamic(
  () => import('@/app/components/BoltStyleMap'),
  { ssr: false, loading: () => <MapSkeleton /> }
);
```

### 2. Throttle Location Updates

```tsx
import { throttle } from 'lodash';

const updateLocation = throttle((location) => {
  setRiderLocation(location);
}, 1000); // Update max once per second
```

### 3. Optimize Polling

```tsx
// Poll more frequently when rider is nearby
const pollInterval = distance < 2 ? 2000 : // 2 sec
                    distance < 5 ? 5000 : // 5 sec
                    10000; // 10 sec
```

---

## 🎓 Best Practices

### 1. **Always Show Loading State**
```tsx
{!isLoaded && <MapSkeleton />}
{isLoaded && <BoltStyleMap {...props} />}
```

### 2. **Handle Errors Gracefully**
```tsx
if (loadError) {
  return <MapErrorMessage />;
}
```

### 3. **Save User's Location**
```tsx
// Save for future orders
localStorage.setItem('lastDeliveryLocation', JSON.stringify(location));
```

### 4. **Validate Delivery Zone**
```tsx
const isInDeliveryZone = distance < MAX_DELIVERY_RADIUS;
if (!isInDeliveryZone) {
  showError('Sorry, we don\'t deliver to this location yet');
}
```

---

## 📖 API Integration

### Backend Endpoint for Rider Location

```typescript
// app/api/orders/[id]/rider-location/route.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { rider: true },
  });

  if (!order || !order.rider) {
    return NextResponse.json(
      { error: 'Order or rider not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    location: {
      lat: order.rider.currentLatitude,
      lng: order.rider.currentLongitude,
    },
    status: order.status,
    lastUpdate: order.rider.locationUpdatedAt,
  });
}
```

### Update Rider Location

```typescript
// POST /api/rider/location

export async function POST(request: Request) {
  const { riderId, lat, lng } = await request.json();

  await prisma.rider.update({
    where: { id: riderId },
    data: {
      currentLatitude: lat,
      currentLongitude: lng,
      locationUpdatedAt: new Date(),
    },
  });

  // Notify customers tracking this rider's deliveries
  await notifyCustomers(riderId);

  return NextResponse.json({ success: true });
}
```

---

## 🎉 What's Next?

### Recommended Enhancements:

1. **Add Address Autocomplete** - Let users search addresses
2. **Implement Real-Time Updates** - WebSockets for live tracking
3. **Add Delivery Zones** - Visual zone boundaries on map
4. **Multi-Language Support** - Translate UI elements
5. **Push Notifications** - Alert users when rider is nearby
6. **Rating System** - Let customers rate delivery experience

---

## 🔗 Resources

- **Google Maps API Docs**: https://developers.google.com/maps
- **React Google Maps**: https://react-google-maps-api-docs.netlify.app/
- **Map Styling Wizard**: https://mapstyle.withgoogle.com/

---

## 📞 Support

Need help? Check:
- `app/components/BoltStyleMap.tsx` - Main component
- `app/map-demo/page.tsx` - Demo implementation
- Server logs for API errors

---

**Status**: ✅ Ready to use!  
**Test URL**: http://localhost:3001/map-demo  
**Created**: January 5, 2026
