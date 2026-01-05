/**
 * Verify OTP Code
 */

import { NextRequest, NextResponse } from 'next/server';

// Shared OTP store (same as send-otp)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\s+/g, '');
  if (normalized.startsWith('0')) {
    normalized = '+254' + normalized.slice(1);
  }
  if (!normalized.startsWith('+254')) {
    normalized = '+254' + normalized;
  }
  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Normalize phone number
    phone = normalizePhoneNumber(phone);

    // Check if OTP exists
    const stored = otpStore.get(phone);
    if (!stored) {
      return NextResponse.json(
        { error: 'OTP not found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (stored.expiresAt < Date.now()) {
      otpStore.delete(phone);
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is correct
    if (stored.code !== otp.toString()) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully
    otpStore.delete(phone); // Clear used OTP

    console.log('✅ OTP VERIFIED:', {
      phone,
      verifiedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      phone,
      verified: true,
      token: Buffer.from(phone).toString('base64'), // Simple token for session
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
