import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Spending Bracket Tiers (based on 10 receipts/orders)
 * Shows the reward structure from the Yaddis card images
 */
const SPENDING_BRACKETS = [
  { minSpend: 0, maxSpend: 30000, rewardValue: 1000 },           // Below 300 = 10 Free
  { minSpend: 30100, maxSpend: 50000, rewardValue: 2000 },       // 301-500 = 20 Free
  { minSpend: 50100, maxSpend: 70000, rewardValue: 3000 },       // 501-700 = 30 Free
  { minSpend: 70100, maxSpend: 90000, rewardValue: 4000 },       // 701-900 = 40 Free
  { minSpend: 90100, maxSpend: 110000, rewardValue: 5000 },      // 901-1,100 = 50 Free
  { minSpend: 110100, maxSpend: 130000, rewardValue: 6000 },     // 1,101-1,300 = 60 Free
  { minSpend: 130100, maxSpend: 150000, rewardValue: 7000 },     // 1,301-1,500 = 70 Free
  { minSpend: 150100, maxSpend: 190000, rewardValue: 8000 },     // 1,501-1,900 = 80 Free
  { minSpend: 190100, maxSpend: 230000, rewardValue: 9000 },     // 1,901-2,300 = 90 Free
  { minSpend: 230100, maxSpend: 300000, rewardValue: 10000 },    // 2,301-3,000 = 100 Free
  { minSpend: 300000, maxSpend: Infinity, rewardValue: 0, customizable: true }, // Above 3k = Customized
];

/**
 * GET /api/rewards/earn/brackets
 * Returns the spending bracket configuration
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      brackets: SPENDING_BRACKETS.map(b => ({
        minSpend: b.minSpend,
        maxSpend: b.maxSpend === Infinity ? null : b.maxSpend,
        rewardValue: b.rewardValue,
        customizable: b.customizable || false,
      })),
    });
  } catch (error) {
    console.error('Error fetching brackets:', error);
    return NextResponse.json({ error: 'Failed to fetch brackets' }, { status: 500 });
  }
}

/**
 * POST /api/rewards/earn
 * Called when an order is placed to update user rewards
 * - Tracks receipt count within 10-receipt brackets
 * - Awards rewards based on total spending in bracket
 * - Resets bracket after 10 receipts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderAmount } = await request.json();

    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json({ error: 'Valid order amount required' }, { status: 400 });
    }

    // Get or create user rewards record
    let userRewards = await prisma.userRewards.findUnique({
      where: { userId: session.user.id },
    });

    if (!userRewards) {
      userRewards = await prisma.userRewards.create({
        data: {
          userId: session.user.id,
          totalSpend: 0,
          purchaseCount: 0,
          pointsEarned: 0,
          pointsRedeemed: 0,
          currentBracketSpend: 0,
          currentBracketReceipts: 0,
          bracketRewardAwarded: 0,
        },
      });
    }

    // Update bracket tracking
    const newBracketReceipts = userRewards.currentBracketReceipts + 1;
    const newBracketSpend = userRewards.currentBracketSpend + orderAmount;
    
    let bracketCompleted = false;
    let bracketRewardAwarded = 0;
    let bracketResetData: any = {};

    // Check if bracket is complete (10 receipts)
    if (newBracketReceipts >= 10) {
      // Find matching bracket for total spend
      const matchedBracket = SPENDING_BRACKETS.find(
        b => newBracketSpend >= b.minSpend && newBracketSpend <= b.maxSpend
      );

      if (matchedBracket) {
        bracketRewardAwarded = matchedBracket.rewardValue;
        bracketCompleted = true;
      }

      // Reset bracket
      bracketResetData = {
        currentBracketSpend: 0,
        currentBracketReceipts: 0,
        bracketRewardAwarded: 0,
      };
    }

    // Update total stats
    const newTotalSpend = userRewards.totalSpend + orderAmount;
    const newPurchaseCount = userRewards.purchaseCount + 1;

    // Update user rewards
    const updatedRewards = await prisma.userRewards.update({
      where: { userId: session.user.id },
      data: {
        totalSpend: newTotalSpend,
        purchaseCount: newPurchaseCount,
        currentBracketSpend: bracketCompleted ? bracketResetData.currentBracketSpend : newBracketSpend,
        currentBracketReceipts: bracketCompleted ? bracketResetData.currentBracketReceipts : newBracketReceipts,
        pointsEarned: bracketCompleted ? { increment: bracketRewardAwarded } : undefined,
        lastPurchaseAt: new Date(),
      },
    });

    // Log reward transaction if bracket completed
    if (bracketCompleted && bracketRewardAwarded > 0) {
      await prisma.rewardTransactionLog.create({
        data: {
          userId: session.user.id,
          type: 'EARNED',
          amount: bracketRewardAwarded,
          description: `Bracket reward: Spent KES ${(newBracketSpend / 100).toFixed(2)} across 10 receipts`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rewards: updatedRewards,
      bracketCompleted,
      bracketRewardAwarded,
      currentBracketProgress: {
        receipts: bracketCompleted ? 1 : newBracketReceipts,
        totalSpend: bracketCompleted ? orderAmount : newBracketSpend,
        maxReceipts: 10,
      },
      message: bracketCompleted 
        ? `🎉 Bracket Complete! You earned KES ${(bracketRewardAwarded / 100).toFixed(2)} Free!`
        : `Receipt ${newBracketReceipts}/10 - Spend so far: KES ${(newBracketSpend / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error earning rewards:', error);
    return NextResponse.json({ error: 'Failed to earn rewards' }, { status: 500 });
  }
}
