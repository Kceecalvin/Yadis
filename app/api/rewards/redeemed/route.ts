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

    const redeemedRewards = await prisma.redeemedReward.findMany({
      where: { userId: session.user.id },
      include: {
        reward: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(redeemedRewards);
  } catch (error) {
    console.error('Error fetching redeemed rewards:', error);
    return NextResponse.json({ error: 'Failed to fetch redeemed rewards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json({ error: 'Reward ID required' }, { status: 400 });
    }

    // Get reward details
    const reward = await prisma.rewardCatalog.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    // Check if reward is active
    if (!reward.isActive) {
      return NextResponse.json({ error: 'This reward is no longer available' }, { status: 400 });
    }

    // Get user rewards
    let userRewards = await prisma.userRewards.findUnique({
      where: { userId: session.user.id },
    });

    if (!userRewards) {
      return NextResponse.json({ error: 'User rewards not initialized' }, { status: 400 });
    }

    // Check if user has spent enough
    if (userRewards.totalSpend < reward.minSpend) {
      const remainingSpend = reward.minSpend - userRewards.totalSpend;
      return NextResponse.json(
        { 
          error: `You need to spend KES ${(remainingSpend / 100).toFixed(2)} more to redeem this reward`,
          remainingSpend,
        },
        { status: 400 }
      );
    }

    // Check stock
    const redeemedCount = await prisma.redeemedReward.count({
      where: { rewardId },
    });

    if (redeemedCount >= reward.quantity) {
      return NextResponse.json(
        { error: 'This reward is out of stock' },
        { status: 400 }
      );
    }

    // Generate unique redemption code
    const code = `REWARD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create redeemed reward
    const redeemedReward = await prisma.redeemedReward.create({
      data: {
        userId: session.user.id,
        rewardId,
        value: reward.value,
        code,
      },
      include: {
        reward: true,
      },
    });

    // Update user rewards
    await prisma.userRewards.update({
      where: { userId: session.user.id },
      data: {
        pointsRedeemed: {
          increment: reward.value,
        },
      },
    });

    // Log transaction
    await prisma.rewardTransactionLog.create({
      data: {
        userId: session.user.id,
        type: 'REDEEMED',
        amount: reward.value,
        description: `Redeemed: ${reward.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      redeemedReward,
      message: `Successfully redeemed ${reward.title}! Use code ${code} to claim your reward.`,
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 });
  }
}
