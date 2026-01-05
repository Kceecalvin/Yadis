import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/loyalty/referral
 * Get referral program info for user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get referrals made by user
    const referrals = await prisma.referralProgram.findMany({
      where: { referrerId: session.user.id },
      include: {
        referred: { select: { name: true, email: true } },
      },
    });

    // Calculate rewards
    const totalRewards = referrals.reduce((sum, ref) => {
      return sum + (ref.status === 'COMPLETED' ? ref.rewardAmount : 0);
    }, 0);

    const completedReferrals = referrals.filter((r) => r.status === 'COMPLETED').length;
    const pendingReferrals = referrals.filter((r) => r.status === 'PENDING').length;

    return NextResponse.json({
      success: true,
      referralProgram: {
        totalReferred: referrals.length,
        completedReferrals,
        pendingReferrals,
        totalRewardsEarned: totalRewards / 100, // Convert to KES
        averageRewardPerReferral:
          completedReferrals > 0 ? totalRewards / completedReferrals / 100 : 0,
      },
      referrals: referrals.map((ref) => ({
        id: ref.id,
        referredName: ref.referred.name,
        referredEmail: ref.referred.email,
        status: ref.status,
        rewardAmount: ref.rewardAmount / 100,
        completedAt: ref.completedAt,
        createdAt: ref.createdAt,
      })),
      referralBonus: {
        perReferral: 50000, // 500 KES per successful referral
        condition: 'Friend makes first purchase',
      },
    });
  } catch (error) {
    console.error('Error fetching referral info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral information' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/referral
 * Create a referral link/invite
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referredEmail } = await request.json();

    if (!referredEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if referred user exists
    const referredUser = await prisma.user.findUnique({
      where: { email: referredEmail },
    });

    if (!referredUser) {
      return NextResponse.json(
        { error: 'User not found. They must sign up first.' },
        { status: 404 }
      );
    }

    if (referredUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    // Check for existing referral
    const existing = await prisma.referralProgram.findUnique({
      where: {
        referrerId_referredId: {
          referrerId: session.user.id,
          referredId: referredUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already referred this user' },
        { status: 400 }
      );
    }

    // Create referral
    const referral = await prisma.referralProgram.create({
      data: {
        referrerId: session.user.id,
        referredId: referredUser.id,
        rewardAmount: 50000, // 500 KES
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        success: true,
        referral,
        message: 'Referral created! You will earn 500 KES when they make their first purchase.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
