/**
 * Welcome Email API
 * Sends welcome email to newly registered users
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { generateWelcomeEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail } = body;

    // Validation
    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    // Generate and send welcome email
    const html = generateWelcomeEmail({
      customerName,
      customerEmail,
    });

    const sent = await sendEmail({
      to: customerEmail,
      subject: '🎉 Welcome to YaddPlast - Best Siku Zote!',
      html,
    });

    if (sent) {
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
