import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/loyalty/tier
 * Get user's loyalty tier and benefits
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create loyalty tier for user
    let userTier = await prisma.userLoyaltyTier.findUnique({
      where: { userId: session.user.id },
      include: { tier: true },
    });

    if (!userTier) {
      // Create default Bronze tier
      const bronzeTier = await prisma.loyaltyTier.findUnique({
        where: { name: 'BRONZE' },
      });

      if (!bronzeTier) {
        return NextResponse.json(
          { error: 'Loyalty tiers not initialized' },
          { status: 500 }
        );
      }

      userTier = await prisma.userLoyaltyTier.create({
        data: {
          userId: session.user.id,
          tierId: bronzeTier.id,
        },
        include: { tier: true },
      });
    }

    // Get all tiers to show progression
    const allTiers = await prisma.loyaltyTier.findMany({
      orderBy: { minSpend: 'asc' },
    });

    // Get user's total spend
    const rewards = await prisma.userRewards.findUnique({
      where: { userId: session.user.id },
    });

    const totalSpend = rewards?.totalSpend || 0;

    // Calculate progress to next tier
    const currentTierIndex = allTiers.findIndex((t) => t.id === userTier!.tierId);
    const nextTier = allTiers[currentTierIndex + 1];
    const progressPercentage = nextTier
      ? Math.min(
          (totalSpend / nextTier.minSpend) * 100,
          100
        )
      : 100;

    return NextResponse.json({
      success: true,
      currentTier: {
        id: userTier.tier.id,
        name: userTier.tier.name,
        minSpend: userTier.tier.minSpend,
        discountPercentage: userTier.tier.discountPercentage,
        pointsMultiplier: userTier.tier.pointsMultiplier,
        earlyAccessToDeals: userTier.tier.earlyAccessToDeals,
        prioritySupport: userTier.tier.prioritySupport,
        achievedAt: userTier.achievedAt,
      },
      nextTier: nextTier
        ? {
            name: nextTier.name,
            minSpend: nextTier.minSpend,
            spendRequired: Math.max(0, nextTier.minSpend - totalSpend),
            discount: nextTier.discountPercentage,
          }
        : null,
      progress: {
        currentSpend: totalSpend / 100,
        progressPercentage: Math.round(progressPercentage),
      },
      allTiers: allTiers.map((t) => ({
        name: t.name,
        minSpend: t.minSpend,
        discount: t.discountPercentage,
        multiplier: t.pointsMultiplier,
      })),
    });
  } catch (error) {
    console.error('Error fetching loyalty tier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty information' },
      { status: 500 }
    );
  }
}
