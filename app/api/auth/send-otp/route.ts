/**
 * Send OTP to Phone Number
 * Supports Kenyan phone numbers (+254 or 0)
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory OTP store (in production, use database/cache)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

function normalizePhoneNumber(phone: string): string {
  // Remove spaces and special characters
  let normalized = phone.replace(/\s+/g, '');
  
  // Convert 07xx to +2547xx
  if (normalized.startsWith('0')) {
    normalized = '+254' + normalized.slice(1);
  }
  
  // Add +254 if not present
  if (!normalized.startsWith('+254')) {
    normalized = '+254' + normalized;
  }
  
  return normalized;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate and normalize phone number
    phone = normalizePhoneNumber(phone);

    // Validate Kenyan phone number format
    if (!/^\+254\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid Kenyan phone number' },
        { status: 400 }
      );
    }

    // Check if OTP was recently sent (rate limiting)
    const existing = otpStore.get(phone);
    if (existing && existing.expiresAt > Date.now() && existing.attempts >= 3) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const attempts = (existing?.attempts || 0) + 1;

    otpStore.set(phone, { code: otp, expiresAt, attempts });

    // Log OTP (in production, send via SMS using Africa's Talking or Twilio)
    console.log('📱 OTP SENT:', {
      phone,
      otp,
      expiresAt: new Date(expiresAt).toISOString(),
      message: `Your Yaddis verification code is: ${otp}. Valid for 10 minutes.`,
    });

    // In production, send SMS here:
    // await sendSMS(phone, `Your Yaddis verification code is: ${otp}. Valid for 10 minutes.`);

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${phone}`,
      expiresIn: 600, // seconds
      phone: phone.replace(/(\d{2})(\d+)(\d{4})/, '$1****$3'), // Masked for security
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
