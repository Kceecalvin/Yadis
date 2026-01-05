import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, minPoints, bonusMultiplier, description } = body;

    if (!name || minPoints < 0 || bonusMultiplier <= 0) {
      return NextResponse.json(
        { error: 'Invalid tier data' },
        { status: 400 }
      );
    }

    // In production, save to database
    return NextResponse.json({
      id: Math.random().toString(),
      name,
      minPoints,
      bonusMultiplier,
      description,
    });
  } catch (error) {
    console.error('Error creating tier:', error);
    return NextResponse.json(
      { error: 'Failed to create tier' },
      { status: 500 }
    );
  }
}
