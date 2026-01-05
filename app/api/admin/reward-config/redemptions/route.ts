import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pointsCost, reward, discountAmount, description } = body;

    if (!reward || pointsCost <= 0 || !description) {
      return NextResponse.json(
        { error: 'Invalid redemption data' },
        { status: 400 }
      );
    }

    // In production, save to database
    return NextResponse.json({
      id: Math.random().toString(),
      pointsCost,
      reward,
      discountAmount: discountAmount || null,
      description,
      isActive: true,
    });
  } catch (error) {
    console.error('Error creating redemption option:', error);
    return NextResponse.json(
      { error: 'Failed to create redemption option' },
      { status: 500 }
    );
  }
}
