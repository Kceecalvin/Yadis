import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/gamification/spin
 * Get user's available spins and spin history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user spins record
    let userSpins = await prisma.userSpins.findUnique({
      where: { userId: session.user.id }
    });

    if (!userSpins) {
      userSpins = await prisma.userSpins.create({
        data: { userId: session.user.id }
      });
    }

    // Get recent spin history
    const recentSpins = await prisma.spinHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      spinsAvailable: userSpins.spinsAvailable,
      totalSpins: userSpins.totalSpins,
      totalWinnings: userSpins.totalWinnings,
      lastSpinAt: userSpins.lastSpinAt,
      recentSpins
    });

  } catch (error) {
    console.error('Get spins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spins' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/spin
 * Execute a spin and award random reward
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user spins
    const userSpins = await prisma.userSpins.findUnique({
      where: { userId: session.user.id }
    });

    if (!userSpins || userSpins.spinsAvailable <= 0) {
      return NextResponse.json(
        { error: 'No spins available' },
        { status: 400 }
      );
    }

    // Get all active spin rewards
    const rewards = await prisma.spinReward.findMany({
      where: { isActive: true },
      orderBy: { probability: 'desc' }
    });

    if (rewards.length === 0) {
      return NextResponse.json(
        { error: 'No rewards available' },
        { status: 500 }
      );
    }

    // Calculate weighted random selection
    const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);
    const random = Math.random() * totalProbability;
    
    let cumulativeProbability = 0;
    let selectedReward = rewards[0];
    
    for (const reward of rewards) {
      cumulativeProbability += reward.probability;
      if (random <= cumulativeProbability) {
        selectedReward = reward;
        break;
      }
    }

    // Start transaction to award reward and update spins
    const result = await prisma.$transaction(async (tx) => {
      // Deduct spin
      const updatedSpins = await tx.userSpins.update({
        where: { userId: session.user.id },
        data: {
          spinsAvailable: { decrement: 1 },
          totalSpins: { increment: 1 },
          totalWinnings: { increment: selectedReward.rewardValue },
          lastSpinAt: new Date()
        }
      });

      // Record spin history
      const spinRecord = await tx.spinHistory.create({
        data: {
          userId: session.user.id!,
          rewardId: selectedReward.id,
          rewardType: selectedReward.rewardType,
          rewardValue: selectedReward.rewardValue,
          rewardName: selectedReward.name
        }
      });

      // Award the prize based on type
      switch (selectedReward.rewardType) {
        case 'POINTS':
          // Add to user rewards
          await tx.userRewards.upsert({
            where: { userId: session.user.id! },
            update: {
              pointsEarned: { increment: selectedReward.rewardValue }
            },
            create: {
              userId: session.user.id!,
              pointsEarned: selectedReward.rewardValue
            }
          });

          // Log transaction
          await tx.rewardTransactionLog.create({
            data: {
              userId: session.user.id!,
              type: 'EARNED',
              amount: selectedReward.rewardValue,
              description: `Spin Wheel: ${selectedReward.name}`
            }
          });
          break;

        case 'FREE_DELIVERY':
          // Create a coupon code for free delivery
          const freeDeliveryCode = `SPIN-FREE-DELIVERY-${Date.now()}`;
          await tx.couponCode.create({
            data: {
              code: freeDeliveryCode,
              discountType: 'FIXED',
              discountValue: 10000, // KES 100 delivery fee
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              isActive: true,
              maxUsesGlobal: 1,
              maxUsesPerUser: 1
            }
          });
          break;

        case 'DISCOUNT':
          // Create a discount coupon
          const discountCode = `SPIN-${selectedReward.rewardValue}OFF-${Date.now()}`;
          await tx.couponCode.create({
            data: {
              code: discountCode,
              discountType: 'PERCENTAGE',
              discountValue: selectedReward.rewardValue,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              isActive: true,
              maxUsesGlobal: 1,
              maxUsesPerUser: 1
            }
          });
          break;
      }

      return { updatedSpins, spinRecord, selectedReward };
    });

    return NextResponse.json({
      success: true,
      reward: {
        name: selectedReward.name,
        description: selectedReward.description,
        icon: selectedReward.icon,
        type: selectedReward.rewardType,
        value: selectedReward.rewardValue,
        color: selectedReward.color
      },
      spinsRemaining: result.updatedSpins.spinsAvailable,
      message: `🎉 You won ${selectedReward.name}!`
    });

  } catch (error) {
    console.error('Spin execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute spin' },
      { status: 500 }
    );
  }
}
