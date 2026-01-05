import { prisma } from '@/lib/db';

/**
 * Check and award badges to a user based on their activity
 * Called after order completion, referral, or other events
 */
export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: { where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } } },
      badges: { include: { badge: true } },
      referralCodesCreated: {
        include: {
          referrals: { where: { status: 'COMPLETED' } }
        }
      }
    }
  });

  if (!user) return [];

  // Get user's current badges
  const earnedBadgeIds = user.badges.map(ub => ub.badgeId);

  // Get all active badges not yet earned
  const availableBadges = await prisma.badge.findMany({
    where: {
      isActive: true,
      id: { notIn: earnedBadgeIds }
    },
    orderBy: { requirement: 'asc' }
  });

  const newlyEarnedBadges = [];

  for (const badge of availableBadges) {
    let shouldAward = false;
    let progress = 0;

    switch (badge.category) {
      case 'PURCHASE':
        progress = user.orders.length;
        shouldAward = progress >= badge.requirement;
        break;

      case 'SPENDING':
        const totalSpent = user.orders.reduce((sum, order) => sum + order.totalCents, 0);
        progress = totalSpent;
        shouldAward = totalSpent >= badge.requirement;
        break;

      case 'REFERRAL':
        const totalReferrals = user.referralCodesCreated.reduce(
          (sum, code) => sum + code.referrals.length, 0
        );
        progress = totalReferrals;
        shouldAward = totalReferrals >= badge.requirement;
        break;

      case 'STREAK':
        // TODO: Implement streak tracking
        // For now, skip streak badges
        break;

      case 'SPECIAL':
        // Special badges awarded manually or by specific events
        break;
    }

    if (shouldAward) {
      // Award the badge
      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
          progress: badge.requirement
        },
        include: { badge: true }
      });

      // Award bonus points if applicable
      if (badge.bonusPoints > 0) {
        await prisma.userRewards.upsert({
          where: { userId },
          update: {
            pointsEarned: { increment: badge.bonusPoints }
          },
          create: {
            userId,
            pointsEarned: badge.bonusPoints
          }
        });
      }

      newlyEarnedBadges.push(userBadge);
    }
  }

  return newlyEarnedBadges;
}

/**
 * Award a special badge to a user
 */
export async function awardSpecialBadge(userId: string, badgeName: string) {
  const badge = await prisma.badge.findUnique({
    where: { name: badgeName }
  });

  if (!badge || !badge.isActive) {
    throw new Error('Badge not found or inactive');
  }

  // Check if already earned
  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: { userId, badgeId: badge.id }
    }
  });

  if (existing) {
    return existing;
  }

  // Award the badge
  const userBadge = await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
      progress: badge.requirement
    },
    include: { badge: true }
  });

  // Award bonus points
  if (badge.bonusPoints > 0) {
    await prisma.userRewards.upsert({
      where: { userId },
      update: {
        pointsEarned: { increment: badge.bonusPoints }
      },
      create: {
        userId,
        pointsEarned: badge.bonusPoints
      }
    });
  }

  return userBadge;
}

/**
 * Get user's badge progress
 */
export async function getUserBadgeProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: { where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } } },
      badges: { include: { badge: true } },
      referralCodesCreated: {
        include: {
          referrals: { where: { status: 'COMPLETED' } }
        }
      }
    }
  });

  if (!user) return null;

  const orderCount = user.orders.length;
  const totalSpent = user.orders.reduce((sum, order) => sum + order.totalCents, 0);
  const totalReferrals = user.referralCodesCreated.reduce(
    (sum, code) => sum + code.referrals.length, 0
  );

  // Get next badge for each category
  const earnedBadgeIds = user.badges.map(ub => ub.badgeId);
  
  const nextBadges = await prisma.badge.findMany({
    where: {
      isActive: true,
      id: { notIn: earnedBadgeIds }
    },
    orderBy: { requirement: 'asc' },
    take: 10
  });

  const progress = {
    earned: user.badges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt
    })),
    nextBadges: nextBadges.map(badge => {
      let current = 0;
      let percentage = 0;

      switch (badge.category) {
        case 'PURCHASE':
          current = orderCount;
          percentage = Math.min((current / badge.requirement) * 100, 100);
          break;
        case 'SPENDING':
          current = totalSpent;
          percentage = Math.min((current / badge.requirement) * 100, 100);
          break;
        case 'REFERRAL':
          current = totalReferrals;
          percentage = Math.min((current / badge.requirement) * 100, 100);
          break;
      }

      return {
        ...badge,
        currentProgress: current,
        requiredProgress: badge.requirement,
        percentage: Math.round(percentage)
      };
    }),
    stats: {
      totalBadges: user.badges.length,
      orderCount,
      totalSpent,
      totalReferrals
    }
  };

  return progress;
}
