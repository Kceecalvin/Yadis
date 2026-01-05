import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { useReferralCode } from '@/lib/referral';

/**
 * POST /api/auth/signup
 * Create new user account with optional referral code
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, referralCode } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
      },
    });

    // Handle referral code if provided
    if (referralCode) {
      try {
        await useReferralCode(referralCode, email, user.id);
        console.log(`User ${user.id} signed up with referral code: ${referralCode}`);
      } catch (referralError: any) {
        // Don't fail signup if referral fails, just log it
        console.error('Referral code error:', referralError.message);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: referralCode 
        ? 'Account created successfully! Referral bonus applied.' 
        : 'Account created successfully!',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
