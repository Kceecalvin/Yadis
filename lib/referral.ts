/**
 * Referral Program Service
 * Manages referral codes and rewards
 */

import { prisma } from './db';
import { 
  awardReferralSignupPoints, 
  awardReferralCompletedPoints,
  checkReferralMilestones 
} from './points-service';
import { checkAndAwardBadges } from './gamification/badge-checker';
import { grantSpinsForReferralMilestone } from './gamification/spin-service';
import { autoAddReferralContestEntry } from './gamification/contest-service';

/**
 * Generate referral code for user
 */
export async function generateReferralCode(
  userId: string,
  discountPercentage: number = 10,
  maxUses?: number
) {
  try {
    // Generate unique code
    const code = `REFER${userId.slice(0, 8).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return await prisma.referralCode.create({
      data: {
        id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        code,
        referrerId: userId,
        discountPercentage: discountPercentage,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        maxUses: maxUses || null,
        usageCount: 0,
      },
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw error;
  }
}

/**
 * Validate and use referral code
 */
export async function useReferralCode(
  code: string,
  referralEmail: string,
  referredUserId?: string
) {
  try {
    const referralCode = await prisma.referralCode.findUnique({
      where: { code },
    });

    if (!referralCode) {
      throw new Error('Invalid referral code');
    }

    if (!referralCode.isActive) {
      throw new Error('Referral code is inactive');
    }

    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
      throw new Error('Referral code has expired');
    }

    if (
      referralCode.maxUses &&
      referralCode.usageCount >= referralCode.maxUses
    ) {
      throw new Error('Referral code usage limit reached');
    }

    // Check if user already has this referral
    const existing = await prisma.referral.findFirst({
      where: {
        codeId: referralCode.id,
        referralEmail,
      },
    });

    if (existing && existing.status === 'COMPLETED') {
      throw new Error('You have already used this referral code');
    }

    // Create referral
    const referral = await prisma.referral.create({
      data: {
        code: { connect: { id: referralCode.id } },
        referralEmail,
        referredUser: referredUserId
          ? { connect: { id: referredUserId } }
          : undefined,
        status: referredUserId ? 'COMPLETED' : 'PENDING',
        completedAt: referredUserId ? new Date() : undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Increment usage count
    await prisma.referralCode.update({
      where: { id: referralCode.id },
      data: { usageCount: { increment: 1 } },
    });

    // If completed, create rewards
    if (referredUserId) {
      await createReferralRewards(referralCode.referrerId, referredUserId, referralCode.id);
      
      // Award points for completed referral
      try {
        await awardReferralCompletedPoints(referralCode.referrerId, referral.id);
      } catch (error) {
        console.error('Error awarding referral points:', error);
      }
      
      // Check and award milestone rewards
      try {
        await checkReferralMilestones(referralCode.referrerId);
      } catch (error) {
        console.error('Error checking milestones:', error);
      }
      
      // Check and award badges
      try {
        await checkAndAwardBadges(referralCode.referrerId);
      } catch (error) {
        console.error('Error checking badges:', error);
      }
      
      // Grant spins for milestones
      try {
        await grantSpinsForReferralMilestone(referralCode.referrerId);
      } catch (error) {
        console.error('Error granting spins:', error);
      }
      
      // Add contest entry
      try {
        await autoAddReferralContestEntry(referralCode.referrerId);
      } catch (error) {
        console.error('Error adding contest entry:', error);
      }
    } else {
      // Award signup points (smaller reward for pending)
      try {
        await awardReferralSignupPoints(referralCode.referrerId, referral.id);
      } catch (error) {
        console.error('Error awarding signup points:', error);
      }
    }

    return referral;
  } catch (error) {
    console.error('Error using referral code:', error);
    throw error;
  }
}

/**
 * Create rewards for referrer and referee
 */
async function createReferralRewards(
  referrerId: string,
  referredUserId: string,
  referralCodeId: string
) {
  try {
    const referralCode = await prisma.referralCode.findUnique({
      where: { id: referralCodeId },
    });

    if (!referralCode) return;

    const discountAmount = 1000; // Fixed reward amount in cents

    // Reward for referrer
    await prisma.referralReward.create({
      data: {
        user: { connect: { id: referrerId } },
        type: 'REFERRER_BONUS',
        amount: discountAmount,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });

    // Discount for referred user
    await prisma.referralReward.create({
      data: {
        user: { connect: { id: referredUserId } },
        type: 'REFEREE_DISCOUNT',
        amount: discountAmount,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
  } catch (error) {
    console.error('Error creating referral rewards:', error);
  }
}

/**
 * Get user referral code
 */
export async function getUserReferralCode(userId: string) {
  return prisma.referralCode.findFirst({
    where: {
      referrerId: userId,
      isActive: true,
    },
  });
}

/**
 * Get user referral stats
 */
export async function getUserReferralStats(userId: string) {
  try {
    // Get user's referral codes first
    const userReferralCodes = await prisma.referralCode.findMany({
      where: { referrerId: userId },
      select: { id: true, code: true },
    });

    const codeIds = userReferralCodes.map(c => c.id);

    const [referralCode, referrals, rewards] = await Promise.all([
      getUserReferralCode(userId),
      codeIds.length > 0 
        ? prisma.referral.findMany({
            where: {
              codeId: { in: codeIds },
            },
            select: {
              id: true,
              status: true,
              referralEmail: true,
            },
          })
        : [],
      prisma.referralReward.findMany({
        where: { userId },
      }),
    ]);

    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED');
    const totalRewardAmount = rewards.reduce((sum, r) => sum + r.amount, 0);
    const usedRewards = rewards.filter(r => r.isUsed).reduce((sum, r) => sum + r.amount, 0);

    return {
      referralCode: referralCode?.code,
      totalReferrals: referrals.length,
      completedReferrals: completedReferrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'PENDING').length,
      totalRewards: totalRewardAmount,
      availableRewards: totalRewardAmount - usedRewards,
      rewards,
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
}

/**
 * Get referral code details
 */
export async function getReferralCodeDetails(code: string) {
  const referralCode = await prisma.referralCode.findUnique({
    where: { code },
    include: {
      referrer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      referrals: {
        select: {
          id: true,
          referralEmail: true,
          status: true,
          completedAt: true,
        },
      },
    },
  });

  if (!referralCode) {
    throw new Error('Referral code not found');
  }

  return referralCode;
}

/**
 * Use referral reward
 */
export async function useReferralReward(rewardId: string) {
  try {
    return await prisma.referralReward.update({
      where: { id: rewardId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error using referral reward:', error);
    throw error;
  }
}

export default {
  generateReferralCode,
  useReferralCode,
  getUserReferralCode,
  getUserReferralStats,
  getReferralCodeDetails,
  useReferralReward,
};
