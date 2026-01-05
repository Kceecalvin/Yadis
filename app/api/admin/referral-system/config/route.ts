import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Default configuration
    const config = {
      freeDeliveries: 5,
      minOrderAmount: 100,
      maxReferralsPerCustomer: 10,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching referral config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { freeDeliveries, minOrderAmount, maxReferralsPerCustomer } = body;

    // Validate inputs
    if (freeDeliveries <= 0 || minOrderAmount < 0 || maxReferralsPerCustomer <= 0) {
      return NextResponse.json(
        { error: 'Invalid configuration values' },
        { status: 400 }
      );
    }

    // In production, save to database
    return NextResponse.json({
      success: true,
      message: 'Referral configuration updated successfully',
      freeDeliveries,
      minOrderAmount,
      maxReferralsPerCustomer,
    });
  } catch (error) {
    console.error('Error updating referral config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
