import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      mpesa: {
        isEnabled: true,
        businessShortCode: '174379',
        consumerKey: process.env.MPESA_CONSUMER_KEY || '',
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
        callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/mpesa/callback`,
        testMode: true,
      },
      stripe: {
        isEnabled: true,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        testMode: true,
      },
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching payment config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { mpesa, stripe } = body;

    // Validate M-Pesa config
    if (mpesa) {
      if (!mpesa.businessShortCode || !mpesa.consumerKey || !mpesa.consumerSecret) {
        return NextResponse.json(
          { error: 'M-Pesa configuration incomplete' },
          { status: 400 }
        );
      }
    }

    // Validate Stripe config
    if (stripe) {
      if (!stripe.publishableKey || !stripe.secretKey) {
        return NextResponse.json(
          { error: 'Stripe configuration incomplete' },
          { status: 400 }
        );
      }
    }

    // In production, save to database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Payment configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment config:', error);
    return NextResponse.json(
      { error: 'Failed to update payment configuration' },
      { status: 500 }
    );
  }
}
