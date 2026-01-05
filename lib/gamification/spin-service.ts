/**
 * Spin Wheel Service
 * Manages spin wheel rewards and grants
 */

import { prisma } from '../db';

/**
 * Grant spins to a user
 */
export async function grantSpins(userId: string, amount: number, reason: string) {
  try {
    const userSpins = await prisma.userSpins.upsert({
      where: { userId },
      update: {
        spinsAvailable: { increment: amount },
        totalSpins: { increment: amount },
      },
      create: {
        userId,
        spinsAvailable: amount,
        totalSpins: amount,
      },
    });

    return userSpins;
  } catch (error) {
    console.error('Error granting spins:', error);
    throw error;
  }
}

/**
 * Grant spins based on referral milestones
 */
export async function grantSpinsForReferralMilestone(userId: string) {
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

    // Define spin milestones
    const spinMilestones = [
      { referrals: 3, spins: 1 },
      { referrals: 5, spins: 2 },
      { referrals: 10, spins: 3 },
      { referrals: 20, spins: 5 },
      { referrals: 50, spins: 10 },
    ];

    // Check if user should get spins
    for (const milestone of spinMilestones) {
      if (totalReferrals === milestone.referrals) {
        await grantSpins(
          userId,
          milestone.spins,
          `${milestone.referrals} referral milestone reached`
        );
        break;
      }
    }

    return totalReferrals;
  } catch (error) {
    console.error('Error granting spins for milestone:', error);
    throw error;
  }
}

/**
 * Use a spin
 */
export async function useSpin(userId: string) {
  try {
    const userSpins = await prisma.userSpins.findUnique({
      where: { userId },
    });

    if (!userSpins || userSpins.spinsAvailable <= 0) {
      throw new Error('No spins available');
    }

    await prisma.userSpins.update({
      where: { userId },
      data: {
        spinsAvailable: { decrement: 1 },
        lastSpinAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error using spin:', error);
    throw error;
  }
}

export default {
  grantSpins,
  grantSpinsForReferralMilestone,
  useSpin,
};
