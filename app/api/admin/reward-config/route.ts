import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return default configuration
    // In production, this would be stored in database
    const config = {
      id: 'default',
      pointsPerKES: 1,
      minOrderForPoints: 100,
      maxPointsPerOrder: 1000,
      pointExpirationDays: 365,
      tiers: [
        { id: '1', name: 'Bronze', minPoints: 0, bonusMultiplier: 1, description: 'Regular customer' },
        { id: '2', name: 'Silver', minPoints: 500, bonusMultiplier: 1.25, description: '25% more points' },
        { id: '3', name: 'Gold', minPoints: 2000, bonusMultiplier: 1.5, description: '50% more points' },
        { id: '4', name: 'Platinum', minPoints: 5000, bonusMultiplier: 2, description: 'Double points' },
      ],
      redemptionOptions: [
        { id: '1', pointsCost: 200, reward: 'discount', discountAmount: 50, description: 'KES 50 off', isActive: true },
        { id: '2', pointsCost: 500, reward: 'discount', discountAmount: 150, description: 'KES 150 off', isActive: true },
        { id: '3', pointsCost: 1000, reward: 'discount', discountAmount: 350, description: 'KES 350 off', isActive: true },
        { id: '4', pointsCost: 300, reward: 'free-item', description: 'Free delivery next order', isActive: true },
      ],
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching reward configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { pointsPerKES, minOrderForPoints, maxPointsPerOrder, pointExpirationDays } = body;

    // In production, save to database
    // For now, just validate and return success
    if (pointsPerKES <= 0 || minOrderForPoints < 0 || maxPointsPerOrder <= 0 || pointExpirationDays <= 0) {
      return NextResponse.json(
        { error: 'Invalid configuration values' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating reward configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
