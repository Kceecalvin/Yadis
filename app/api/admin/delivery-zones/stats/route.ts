import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock stats
    const stats = {
      totalZones: 5,
      freeDeliveryZones: 4,
      paidDeliveryZones: 1,
      avgDeliveryTime: 28,
      totalDeliveries: 1250,
      avgDeliveryAccuracy: 94,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching delivery zone stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
