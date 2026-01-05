/**
 * Phone-Based Sign In
 * Step 1: Send OTP to phone number
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendSignInCodeSMS } from '@/lib/africas-talking-sms';

// Store for phone sign-in sessions
const phoneSignInStore = new Map<string, { 
  otp: string; 
  expiresAt: number; 
  attempts: number;
  sessionId: string;
}>();

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

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

    // Normalize phone
    phone = normalizePhoneNumber(phone);

    // Validate Kenyan phone
    if (!/^\+254\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid Kenyan phone number' },
        { status: 400 }
      );
    }

    // Rate limiting
    const existing = phoneSignInStore.get(phone);
    if (existing && existing.expiresAt > Date.now() && existing.attempts >= 3) {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP and session
    const otp = generateOTP();
    const sessionId = generateSessionId();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const attempts = (existing?.attempts || 0) + 1;

    phoneSignInStore.set(phone, { otp, expiresAt, attempts, sessionId });

    console.log('📱 PHONE SIGN-IN OTP SENT:', {
      phone,
      otp,
      sessionId,
      expiresAt: new Date(expiresAt).toISOString(),
      message: `Your Yaddis sign-in code is: ${otp}. Valid for 10 minutes.`,
    });

    // Send SMS via Africa's Talking
    try {
      await sendSignInCodeSMS(phone, otp);
    } catch (smsError) {
      console.error('SMS sending failed (non-critical):', smsError);
      // Don't fail the request if SMS fails
    }

    return NextResponse.json({
      success: true,
      message: `Sign-in code sent to ${phone}`,
      phone: phone.replace(/(\d{2})(\d+)(\d{4})/, '$1****$3'),
      sessionId,
      expiresIn: 600,
    });
  } catch (error) {
    console.error('Error sending phone sign-in OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send sign-in code' },
      { status: 500 }
    );
  }
}
