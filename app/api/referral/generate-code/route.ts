/**
 * Generate Referral Code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'YADDI-';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      );
    }

    // Generate unique referral code
    const referralCode = generateReferralCode();

    // In a real app, save to database
    console.log('📢 REFERRAL CODE GENERATED:', {
      userId: session.user.email,
      referralCode,
      timestamp: new Date().toISOString(),
      rewardsAmount: 500, // KES 500 for referrer and referee
    });

    return NextResponse.json({
      success: true,
      referralCode,
      shareLink: `${process.env.NEXT_PUBLIC_SITE_URL}?ref=${referralCode}`,
      rewardsAmount: 'KES 500',
      message: 'Share your referral code and earn rewards!',
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}
