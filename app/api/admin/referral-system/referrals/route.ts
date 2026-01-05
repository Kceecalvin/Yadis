import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Default referrals - in production, fetch from database
    const referrals = [
      {
        id: '1',
        code: 'JOHN123',
        referrerId: 'user1',
        referrerName: 'John Doe',
        referrerEmail: 'john@example.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalReferred: 8,
        activeReferred: 8,
        freeDeliveriesEarned: 40,
        freeDeliveriesUsed: 15,
        status: 'active' as const,
      },
      {
        id: '2',
        code: 'JANE456',
        referrerId: 'user2',
        referrerName: 'Jane Smith',
        referrerEmail: 'jane@example.com',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        totalReferred: 6,
        activeReferred: 5,
        freeDeliveriesEarned: 25,
        freeDeliveriesUsed: 8,
        status: 'active' as const,
      },
      {
        id: '3',
        code: 'MIKE789',
        referrerId: 'user3',
        referrerName: 'Mike Johnson',
        referrerEmail: 'mike@example.com',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        totalReferred: 5,
        activeReferred: 4,
        freeDeliveriesEarned: 20,
        freeDeliveriesUsed: 12,
        status: 'active' as const,
      },
      {
        id: '4',
        code: 'SARAH321',
        referrerId: 'user4',
        referrerName: 'Sarah Williams',
        referrerEmail: 'sarah@example.com',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        totalReferred: 4,
        activeReferred: 3,
        freeDeliveriesEarned: 15,
        freeDeliveriesUsed: 5,
        status: 'active' as const,
      },
      {
        id: '5',
        code: 'DAVID654',
        referrerId: 'user5',
        referrerName: 'David Brown',
        referrerEmail: 'david@example.com',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        totalReferred: 3,
        activeReferred: 2,
        freeDeliveriesEarned: 10,
        freeDeliveriesUsed: 2,
        status: 'active' as const,
      },
    ];

    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
