import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Default stats - in production, fetch from database
    const stats = {
      totalReferrals: 45,
      pendingReferrals: 12,
      convertedReferrals: 33,
      totalFreeDeliveries: 165,
      topReferrers: [
        {
          id: '1',
          code: 'JOHN123',
          referrerName: 'John Doe',
          referrerEmail: 'john@example.com',
          totalReferred: 8,
          activeReferred: 8,
          freeDeliveriesEarned: 40,
          freeDeliveriesUsed: 15,
        },
        {
          id: '2',
          code: 'JANE456',
          referrerName: 'Jane Smith',
          referrerEmail: 'jane@example.com',
          totalReferred: 6,
          activeReferred: 5,
          freeDeliveriesEarned: 25,
          freeDeliveriesUsed: 8,
        },
        {
          id: '3',
          code: 'MIKE789',
          referrerName: 'Mike Johnson',
          referrerEmail: 'mike@example.com',
          totalReferred: 5,
          activeReferred: 4,
          freeDeliveriesEarned: 20,
          freeDeliveriesUsed: 12,
        },
      ],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral statistics' },
      { status: 500 }
    );
  }
}
