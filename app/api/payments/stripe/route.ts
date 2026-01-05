import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

/**
 * POST /api/payments/stripe
 * Creates a Stripe payment intent for an order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { orderId, amount, email } = await request.json();

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order or amount' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Order does not belong to user' },
        { status: 403 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: 'usd', // Change to 'kes' when supported or use conversion
      metadata: {
        orderId,
        userId: session.user.id,
      },
      description: `Payment for order ${orderId}`,
      receipt_email: email || session.user.email,
    });

    // Store payment intent in database
    await prisma.payment.create({
      data: {
        orderId,
        method: 'STRIPE',
        status: 'PENDING',
        amount: Math.round(amount),
        currency: 'KES',
        transactionId: paymentIntent.id,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
        },
      },
    });

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Stripe payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/stripe/confirm
 * Confirms a completed Stripe payment
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { paymentIntentId, orderId } = await request.json();

    if (!paymentIntentId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Update payment status in database
    const payment = await prisma.payment.update({
      where: { transactionId: paymentIntentId },
      data: {
        status: 'COMPLETED',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment confirmed',
        payment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
