import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Default zones - Kirinyaga/Kutus areas (store location in Kutus, Kirinyaga)
    const zones = [
      // ===== KIRINYAGA ZONES (PRIMARY SERVICE AREA) =====
      // Note: Store is located in Kutus, Kirinyaga County (latitude: -0.6838, longitude: 37.2675)
      
      // ===== KUTUS ZONES - CENTERED AT SUNRISE HOSTEL =====
      {
        id: '6',
        name: 'Sunrise Hostel (Store Location)',
        latitude: -0.6838,
        longitude: 37.2675,
        radiusKM: 0.5,
        freeDelivery: true,
        deliveryFee: 0,
        estimatedTime: 5,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '7',
        name: 'Sunrise Hostel Vicinity - Free Delivery',
        latitude: -0.6838,
        longitude: 37.2675,
        radiusKM: 1,
        freeDelivery: true,
        deliveryFee: 0,
        estimatedTime: 8,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '8',
        name: 'Kutus Central - Nearby Hostels',
        latitude: -0.6838,
        longitude: 37.2675,
        radiusKM: 2,
        freeDelivery: false,
        deliveryFee: 50,
        estimatedTime: 15,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '9',
        name: 'North Kutus Hostels',
        latitude: -0.6700,
        longitude: 37.2675,
        radiusKM: 2,
        freeDelivery: false,
        deliveryFee: 75,
        estimatedTime: 20,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '10',
        name: 'South Kutus - Student Area',
        latitude: -0.6950,
        longitude: 37.2675,
        radiusKM: 2,
        freeDelivery: false,
        deliveryFee: 60,
        estimatedTime: 18,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '11',
        name: 'East Kutus - University Area',
        latitude: -0.6838,
        longitude: 37.2850,
        radiusKM: 2,
        freeDelivery: false,
        deliveryFee: 55,
        estimatedTime: 17,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '12',
        name: 'West Kutus - Residential',
        latitude: -0.6838,
        longitude: 37.2500,
        radiusKM: 2,
        freeDelivery: false,
        deliveryFee: 70,
        estimatedTime: 22,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json(zones);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery zones' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, latitude, longitude, radiusKM, freeDelivery, deliveryFee, estimatedTime } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new zone
    const newZone = {
      id: Date.now().toString(),
      name,
      latitude,
      longitude,
      radiusKM,
      freeDelivery,
      deliveryFee,
      estimatedTime,
      active: true,
      createdAt: new Date().toISOString(),
    };

    // In production, save to database
    return NextResponse.json(newZone, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery zone' },
      { status: 500 }
    );
  }
}
