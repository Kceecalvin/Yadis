/**
 * Points System Service
 * Manages user points, transactions, and rewards
 */

import { prisma } from './db';

// Points values configuration
export const POINTS_CONFIG = {
  REFERRAL_SIGNUP: 50,           // When referee signs up
  REFERRAL_COMPLETED: 200,       // When referee makes first purchase
  MILESTONE_5_REFERRALS: 500,
  MILESTONE_10_REFERRALS: 1500,
  MILESTONE_20_REFERRALS: 2500,
  MILESTONE_50_REFERRALS: 10000,
  BADGE_EARNED: 100,             // Bonus for earning any badge
  CONTEST_WIN: 1000,             // Contest winner bonus
  LEADERBOARD_TOP3: 1000,        // Monthly top 3 bonus
  ORDER_PLACED: 10,              // Per order (optional)
  REVIEW_SUBMITTED: 25,          // Per review (optional)
};

/**
 * Award points to a user
 */
export async function awardPoints(
  userId: string,
  amount: number,
  type: string,
  description: string,
  metadata?: any
) {
  try {
    // Get or create user points
    let userPoints = await prisma.userPoints.findUnique({
      where: { userId },
    });

    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: { userId },
      });
    }

    // Calculate new balance
    const newBalance = userPoints.availablePoints + amount;
    const newTotal = userPoints.totalPoints + amount;

    // Update points
    const updated = await prisma.userPoints.update({
      where: { userId },
      data: {
        totalPoints: newTotal,
        availablePoints: newBalance,
      },
    });

    // Create transaction record
    await prisma.pointsTransaction.create({
      data: {
        userId,
        type,
        amount,
        balance: newBalance,
        description,
        metadata: metadata || {},
        referralId: metadata?.referralId,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Deduct points from a user
 */
export async function deductPoints(
  userId: string,
  amount: number,
  type: string,
  description: string,
  metadata?: any
) {
  try {
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId },
    });

    if (!userPoints) {
      throw new Error('User has no points account');
    }

    if (userPoints.availablePoints < amount) {
      throw new Error('Insufficient points');
    }

    const newBalance = userPoints.availablePoints - amount;
    const newUsed = userPoints.usedPoints + amount;

    // Update points
    const updated = await prisma.userPoints.update({
      where: { userId },
      data: {
        availablePoints: newBalance,
        usedPoints: newUsed,
      },
    });

    // Create transaction record
    await prisma.pointsTransaction.create({
      data: {
        userId,
        type,
        amount: -amount,
        balance: newBalance,
        description,
        metadata: metadata || {},
      },
    });

    return updated;
  } catch (error) {
    console.error('Error deducting points:', error);
    throw error;
  }
}

/**
 * Get user points balance
 */
export async function getUserPoints(userId: string) {
  try {
    let userPoints = await prisma.userPoints.findUnique({
      where: { userId },
    });

    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: { userId },
      });
    }

    return userPoints;
  } catch (error) {
    console.error('Error getting user points:', error);
    throw error;
  }
}

/**
 * Get user points transaction history
 */
export async function getPointsHistory(userId: string, limit: number = 50) {
  try {
    return await prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error getting points history:', error);
    throw error;
  }
}

/**
 * Award points for referral signup
 */
export async function awardReferralSignupPoints(referrerId: string, referralId: string) {
  return awardPoints(
    referrerId,
    POINTS_CONFIG.REFERRAL_SIGNUP,
    'EARNED_REFERRAL',
    'Friend signed up with your referral code',
    { referralId, stage: 'signup' }
  );
}

/**
 * Award points for completed referral
 */
export async function awardReferralCompletedPoints(referrerId: string, referralId: string) {
  return awardPoints(
    referrerId,
    POINTS_CONFIG.REFERRAL_COMPLETED,
    'EARNED_REFERRAL',
    'Friend completed their first purchase',
    { referralId, stage: 'completed' }
  );
}

/**
 * Award milestone points
 */
export async function awardMilestonePoints(
  userId: string,
  milestoneType: string,
  milestoneValue: number,
  pointsAmount: number
) {
  return awardPoints(
    userId,
    pointsAmount,
    'EARNED_MILESTONE',
    `Reached ${milestoneValue} ${milestoneType} milestone!`,
    { milestoneType, milestoneValue }
  );
}

/**
 * Award badge points
 */
export async function awardBadgePoints(userId: string, badgeName: string) {
  return awardPoints(
    userId,
    POINTS_CONFIG.BADGE_EARNED,
    'EARNED_BADGE',
    `Earned "${badgeName}" badge`,
    { badgeName }
  );
}

/**
 * Award contest points
 */
export async function awardContestPoints(
  userId: string,
  contestName: string,
  pointsAmount: number
) {
  return awardPoints(
    userId,
    pointsAmount,
    'EARNED_CONTEST',
    `Won "${contestName}" contest`,
    { contestName }
  );
}

/**
 * Check and award referral milestone points
 */
export async function checkReferralMilestones(userId: string) {
  try {
    // Count completed referrals
    const referralCodes = await prisma.referralCode.findMany({
      where: { referrerId: userId },
      include: {
        referrals: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    const totalReferrals = referralCodes.reduce(
      (sum, code) => sum + code.referrals.length,
      0
    );

    // Check milestones
    const milestones = [
      { count: 5, points: POINTS_CONFIG.MILESTONE_5_REFERRALS },
      { count: 10, points: POINTS_CONFIG.MILESTONE_10_REFERRALS },
      { count: 20, points: POINTS_CONFIG.MILESTONE_20_REFERRALS },
      { count: 50, points: POINTS_CONFIG.MILESTONE_50_REFERRALS },
    ];

    for (const milestone of milestones) {
      if (totalReferrals >= milestone.count) {
        // Check if already awarded
        const existing = await prisma.pointsTransaction.findFirst({
          where: {
            userId,
            type: 'EARNED_MILESTONE',
            description: {
              contains: `${milestone.count} referrals`,
            },
          },
        });

        if (!existing) {
          await awardMilestonePoints(
            userId,
            'referrals',
            milestone.count,
            milestone.points
          );
        }
      }
    }

    return totalReferrals;
  } catch (error) {
    console.error('Error checking referral milestones:', error);
    throw error;
  }
}

/**
 * Get rewards store items
 */
export async function getRewardsStoreItems(category?: string) {
  try {
    return await prisma.rewardStoreItem.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { pointsCost: 'asc' },
      ],
    });
  } catch (error) {
    console.error('Error getting rewards store items:', error);
    throw error;
  }
}

/**
 * Redeem a reward
 */
export async function redeemReward(userId: string, rewardId: string) {
  try {
    // Get reward
    const reward = await prisma.rewardStoreItem.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new Error('Reward not found');
    }

    if (!reward.isActive) {
      throw new Error('Reward is not available');
    }

    if (reward.stock !== null && reward.stock <= 0) {
      throw new Error('Reward is out of stock');
    }

    // Check user points
    const userPoints = await getUserPoints(userId);
    if (userPoints.availablePoints < reward.pointsCost) {
      throw new Error('Insufficient points');
    }

    // Deduct points
    await deductPoints(
      userId,
      reward.pointsCost,
      'REDEEMED',
      `Redeemed: ${reward.name}`,
      { rewardId }
    );

    // Generate redemption code if applicable
    let code: string | undefined;
    if (reward.type === 'DISCOUNT' || reward.type === 'FREE_DELIVERY') {
      code = `REWARD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    // Create redemption record
    const redemption = await prisma.rewardRedemption.create({
      data: {
        userId,
        rewardId,
        pointsSpent: reward.pointsCost,
        code,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Update stock if limited
    if (reward.stock !== null) {
      await prisma.rewardStoreItem.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      });
    }

    return redemption;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    throw error;
  }
}

/**
 * Get user redemptions
 */
export async function getUserRedemptions(userId: string) {
  try {
    return await prisma.rewardRedemption.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting user redemptions:', error);
    throw error;
  }
}

export default {
  awardPoints,
  deductPoints,
  getUserPoints,
  getPointsHistory,
  awardReferralSignupPoints,
  awardReferralCompletedPoints,
  awardMilestonePoints,
  awardBadgePoints,
  awardContestPoints,
  checkReferralMilestones,
  getRewardsStoreItems,
  redeemReward,
  getUserRedemptions,
  POINTS_CONFIG,
};
