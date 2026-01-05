import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { useReferralCode } from '@/lib/referral';

/**
 * POST /api/referral/apply-post-signup
 * Apply referral code after OAuth signup
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code required' },
        { status: 400 }
      );
    }

    // Apply referral code
    await useReferralCode(referralCode, session.user.email!, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully!',
    });
  } catch (error: any) {
    console.error('Apply referral code error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply referral code' },
      { status: 400 }
    );
  }
}
