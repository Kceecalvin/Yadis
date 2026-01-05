import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/gamification/milestones
 * Get milestones with achievement status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active milestones
    const allMilestones = await prisma.milestone.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Get user's achieved milestones
    const userMilestones = await prisma.userMilestone.findMany({
      where: { userId: session.user.id },
    });

    const achievedMilestoneIds = new Set(userMilestones.map((um) => um.milestoneId));

    const milestones = allMilestones.map((milestone) => ({
      id: milestone.id,
      name: milestone.name,
      description: milestone.description,
      icon: milestone.icon,
      type: milestone.type,
      threshold: milestone.threshold,
      rewardType: milestone.rewardType,
      rewardValue: milestone.rewardValue,
      achieved: achievedMilestoneIds.has(milestone.id),
      achievedAt: achievedMilestoneIds.has(milestone.id)
        ? userMilestones.find((um) => um.milestoneId === milestone.id)?.achievedAt
        : null,
    }));

    return NextResponse.json({
      success: true,
      milestones,
    });
  } catch (error) {
    console.error('Get milestones error:', error);
    return NextResponse.json(
      { error: 'Failed to get milestones' },
      { status: 500 }
    );
  }
}
