/**
 * Phone-Based Sign In - Verify OTP
 * Step 2: Verify OTP and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Store for phone sign-in sessions (shared with phone-signin route)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { phone, otp, sessionId } = body;

    if (!phone || !otp || !sessionId) {
      return NextResponse.json(
        { error: 'Phone, OTP, and session ID are required' },
        { status: 400 }
      );
    }

    // Normalize phone
    phone = normalizePhoneNumber(phone);

    // Check session
    const stored = phoneSignInStore.get(phone);
    if (!stored || stored.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Invalid session. Please request a new sign-in code.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (stored.expiresAt < Date.now()) {
      phoneSignInStore.delete(phone);
      return NextResponse.json(
        { error: 'Sign-in code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check OTP
    if (stored.otp !== otp.toString()) {
      return NextResponse.json(
        { error: 'Invalid sign-in code. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified - find or create user
    try {
      let user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            phone,
            name: `User ${phone.slice(-4)}`, // Default name
            email: `${phone}@yaddis.local`, // Placeholder email
            emailVerified: new Date(),
          },
        });

        console.log('✅ NEW USER CREATED VIA PHONE:', {
          phone,
          userId: user.id,
          createdAt: new Date().toISOString(),
        });
      }

      // Clear used OTP
      phoneSignInStore.delete(phone);

      console.log('✅ PHONE SIGN-IN SUCCESSFUL:', {
        phone,
        userId: user.id,
        userName: user.name,
        signedInAt: new Date().toISOString(),
      });

      // Return success with user data
      return NextResponse.json({
        success: true,
        message: 'Sign-in successful',
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
        },
        authToken: Buffer.from(JSON.stringify({ userId: user.id, phone })).toString('base64'),
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create or retrieve user' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error verifying phone sign-in:', error);
    return NextResponse.json(
      { error: 'Failed to verify sign-in code' },
      { status: 500 }
    );
  }
}
