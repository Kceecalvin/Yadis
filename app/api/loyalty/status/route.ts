import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/loyalty/status
 * Get user's loyalty tier and benefits
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Loyalty tier thresholds
    const TIERS = [
      { name: 'BRONZE', minSpend: 0, discountPercentage: 0, pointsMultiplier: 1.0 },
      { name: 'SILVER', minSpend: 10000000, discountPercentage: 5, pointsMultiplier: 1.5 }, // 100,000 KES
      { name: 'GOLD', minSpend: 50000000, discountPercentage: 10, pointsMultiplier: 2.0 }, // 500,000 KES
      { name: 'PLATINUM', minSpend: 100000000, discountPercentage: 15, pointsMultiplier: 2.5 }, // 1,000,000 KES
    ];

    // Get user's total spend
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      select: { totalCents: true },
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.totalCents, 0);

    // Find current tier
    let currentTier = TIERS[0];
    for (const tier of TIERS) {
      if (totalSpent >= tier.minSpend) {
        currentTier = tier;
      }
    }

    // Find next tier
    const nextTierIndex = TIERS.findIndex((t) => t.name === currentTier.name) + 1;
    const nextTier = TIERS[nextTierIndex];

    // Calculate benefits
    const benefits = [
      `${currentTier.discountPercentage}% discount on all purchases`,
      `${currentTier.pointsMultiplier}x reward points multiplier`,
      'Free delivery on orders over KES 1,000',
      'Priority customer support',
    ];

    if (currentTier.name === 'SILVER') {
      benefits.push('Early access to sales');
    }
    if (currentTier.name === 'GOLD') {
      benefits.push('Exclusive members-only products');
    }
    if (currentTier.name === 'PLATINUM') {
      benefits.push('VIP birthday gift');
      benefits.push('Personal shopping assistant');
    }

    // Update or create user loyalty tier
    let userTier = await prisma.userLoyaltyTier.findUnique({
      where: { userId: session.user.id },
    });

    if (!userTier || userTier.tierId !== currentTier.name) {
      const tier = await prisma.loyaltyTier.findUnique({
        where: { name: currentTier.name },
      });

      if (tier) {
        userTier = await prisma.userLoyaltyTier.upsert({
          where: { userId: session.user.id },
          update: { tierId: tier.id },
          create: {
            userId: session.user.id,
            tierId: tier.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      loyalty: {
        currentTier,
        nextTier: nextTier
          ? {
              name: nextTier.name,
              minSpend: nextTier.minSpend,
              spendRemaining: Math.max(0, nextTier.minSpend - totalSpent),
            }
          : null,
        totalSpent,
        benefits,
      },
    });
  } catch (error) {
    console.error('Error fetching loyalty status:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty status' }, { status: 500 });
  }
}
