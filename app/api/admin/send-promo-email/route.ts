/**
 * API to send promotional emails to users
 * Admin endpoint to send marketing campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sendEmail } from '@/lib/email-service';
import { generatePromoEmail } from '@/lib/email-templates';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      message,
      promoCode,
      discount,
      validUntil,
      recipientEmails, // Array of emails or 'all' for all users
      ctaText,
      ctaLink,
    } = body;

    // Validation
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Get recipient emails
    let emails: string[] = [];

    if (recipientEmails === 'all') {
      // Send to all users
      const users = await prisma.user.findMany({
        select: { email: true, name: true },
      });
      emails = users.map((u) => u.email || '');
    } else if (Array.isArray(recipientEmails)) {
      emails = recipientEmails;
    } else {
      return NextResponse.json(
        { error: 'recipientEmails must be "all" or an array of emails' },
        { status: 400 }
      );
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { error: 'No recipient emails found' },
        { status: 400 }
      );
    }

    // Send emails
    const sentEmails = [];
    const failedEmails = [];

    for (const email of emails) {
      if (!email) continue;

      try {
        // Get user name if available
        const user = await prisma.user.findUnique({
          where: { email },
          select: { name: true },
        });

        const html = generatePromoEmail({
          recipientName: user?.name || 'Valued Customer',
          title,
          message,
          promoCode,
          discount,
          validUntil,
          ctaText,
          ctaLink,
        });

        const sent = await sendEmail({
          to: email,
          subject: title,
          html,
        });

        if (sent) {
          sentEmails.push(email);
        } else {
          failedEmails.push(email);
        }
      } catch (error) {
        console.error(`Error sending to ${email}:`, error);
        failedEmails.push(email);
      }
    }

    // Log campaign
    if (prisma.emailCampaign) {
      try {
        await prisma.emailCampaign.create({
          data: {
            title,
            message,
            promoCode: promoCode || null,
            discount: discount || null,
            totalRecipients: emails.length,
            sentCount: sentEmails.length,
            failedCount: failedEmails.length,
            recipientEmails: JSON.stringify(emails),
          },
        });
      } catch (error) {
        console.log('Email campaign not logged (table may not exist)');
      }
    }

    return NextResponse.json({
      success: true,
      message: `Campaign sent: ${sentEmails.length} sent, ${failedEmails.length} failed`,
      sent: sentEmails.length,
      failed: failedEmails.length,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    });
  } catch (error) {
    console.error('Error sending promo emails:', error);
    return NextResponse.json(
      { error: 'Failed to send promotional emails' },
      { status: 500 }
    );
  }
}

// GET endpoint to get campaign history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Return campaign statistics
    return NextResponse.json({
      message: 'Use POST to send promotional campaigns',
      example: {
        title: 'Summer Sale - 50% Off!',
        message: 'We are excited to offer you 50% off on all items this summer!',
        promoCode: 'SUMMER50',
        discount: 50,
        validUntil: '2025-12-31',
        recipientEmails: 'all', // or array of specific emails
        ctaText: 'Shop Now',
        ctaLink: 'https://yaddplast.store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get campaign info' },
      { status: 500 }
    );
  }
}
