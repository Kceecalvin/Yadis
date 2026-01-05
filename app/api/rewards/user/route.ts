import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userRewards = await prisma.userRewards.findUnique({
      where: { userId: session.user.id },
    });

    // Create default rewards record if doesn't exist
    if (!userRewards) {
      userRewards = await prisma.userRewards.create({
        data: {
          userId: session.user.id,
          totalSpend: 0,
          purchaseCount: 0,
          pointsEarned: 0,
          pointsRedeemed: 0,
        },
      });
    }

    return NextResponse.json(userRewards);
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}
