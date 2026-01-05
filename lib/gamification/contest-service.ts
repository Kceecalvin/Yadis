/**
 * Contest Service
 * Manages contests, entries, and winner selection
 */

import { prisma } from '../db';

/**
 * Create a monthly referral contest
 */
export async function createMonthlyReferralContest() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const contestName = `Monthly Referral Challenge - ${now.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  })}`;

  // Check if contest already exists
  const existing = await prisma.contest.findFirst({
    where: { name: contestName },
  });

  if (existing) {
    return existing;
  }

  return await prisma.contest.create({
    data: {
      name: contestName,
      description: 'Refer the most friends this month and win amazing prizes! Top 3 referrers get special rewards.',
      type: 'REFERRAL',
      prizeType: 'POINTS',
      prizeValue: 5000,
      prizeDescription: '1st: 5000 points, 2nd: 3000 points, 3rd: 1000 points',
      startDate: startOfMonth,
      endDate: endOfMonth,
      isActive: true,
    },
  });
}

/**
 * Add contest entry for a user
 */
export async function addContestEntry(contestId: string, userId: string, entries: number = 1) {
  try {
    // Get contest
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest || !contest.isActive) {
      return null;
    }

    // Check if contest is ongoing
    const now = new Date();
    if (now < contest.startDate || now > contest.endDate) {
      return null;
    }

    // Upsert entry
    const entry = await prisma.contestEntry.upsert({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
      update: {
        entries: { increment: entries },
        score: { increment: entries },
      },
      create: {
        contestId,
        userId,
        entries,
        score: entries,
      },
    });

    return entry;
  } catch (error) {
    console.error('Error adding contest entry:', error);
    throw error;
  }
}

/**
 * Get active contests
 */
export async function getActiveContests(type?: string) {
  const now = new Date();

  return await prisma.contest.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      ...(type && { type }),
    },
    include: {
      entries: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          score: 'desc',
        },
        take: 10,
      },
    },
  });
}

/**
 * Get contest leaderboard
 */
export async function getContestLeaderboard(contestId: string, limit: number = 100) {
  return await prisma.contestEntry.findMany({
    where: { contestId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      score: 'desc',
    },
    take: limit,
  });
}

/**
 * End contest and select winner
 */
export async function endContest(contestId: string) {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        entries: {
          orderBy: { score: 'desc' },
          take: 1,
        },
      },
    });

    if (!contest) {
      throw new Error('Contest not found');
    }

    const winner = contest.entries[0];

    if (!winner) {
      // No entries, just mark as inactive
      return await prisma.contest.update({
        where: { id: contestId },
        data: {
          isActive: false,
        },
      });
    }

    // Update contest with winner
    return await prisma.contest.update({
      where: { id: contestId },
      data: {
        isActive: false,
        winnerId: winner.userId,
        winnerAnnounced: true,
      },
    });
  } catch (error) {
    console.error('Error ending contest:', error);
    throw error;
  }
}

/**
 * Auto-add referral contest entries
 */
export async function autoAddReferralContestEntry(userId: string) {
  try {
    // Get active referral contest
    const contests = await getActiveContests('REFERRAL');

    for (const contest of contests) {
      await addContestEntry(contest.id, userId, 1);
    }
  } catch (error) {
    console.error('Error auto-adding contest entry:', error);
  }
}

/**
 * Get user's contest participation
 */
export async function getUserContestEntries(userId: string) {
  return await prisma.contestEntry.findMany({
    where: { userId },
    include: {
      contest: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default {
  createMonthlyReferralContest,
  addContestEntry,
  getActiveContests,
  getContestLeaderboard,
  endContest,
  autoAddReferralContestEntry,
  getUserContestEntries,
};
