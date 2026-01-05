import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { getUserReferralStats, getUserReferralCode, generateReferralCode } from '@/lib/referral';
import { prisma } from '@/lib/db';

/**
 * GET /api/referral/stats
 * Get user's referral statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session in referral stats:', session); // Debug log

    if (!session?.user?.id) {
      console.log('No session found, returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized', session: session }, { status: 401 });
    }

    // First, verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.error('User not found in database:', session.user.id);
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign in again.' },
        { status: 404 }
      );
    }

    // Get or create referral code
    let referralCode = await getUserReferralCode(session.user.id);
    
    if (!referralCode) {
      referralCode = await generateReferralCode(session.user.id);
    }

    // Get stats
    const stats = await getUserReferralStats(session.user.id);

    return NextResponse.json({
      success: true,
      referralCode: referralCode.code,
      stats: {
        totalReferrals: stats.totalReferrals,
        completedReferrals: stats.completedReferrals,
        pendingReferrals: stats.pendingReferrals,
      },
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get referral stats' },
      { status: 500 }
    );
  }
}
