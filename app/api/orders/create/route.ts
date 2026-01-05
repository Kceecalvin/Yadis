import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/orders/create
 * Creates a new order for authenticated user and tracks rewards
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Require authentication - no guest checkout
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in to place order' }, { status: 401 });
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error('User not found in database:', session.user.id);
      return NextResponse.json({ error: 'User account not found. Please sign out and sign in again.' }, { status: 400 });
    }

    const { 
      items, 
      totalAmount, 
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress, 
      deliveryBuilding, 
      deliveryHouse, 
      deliveryFloor, 
      deliveryCity, 
      deliveryNotes, 
      deliveryMethod,
      deliveryLatitude,
      deliveryLongitude,
      deliveryFee,
      deliveryZone,
      notes
    } = await request.json();

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Valid order amount required' }, { status: 400 });
    }

    // Validate customer information
    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
    }

    // Validate delivery information for delivery orders
    if (deliveryMethod === 'delivery' && !deliveryAddress) {
      return NextResponse.json({ error: 'Delivery address is required for delivery orders' }, { status: 400 });
    }

    // Create order for Yadplast
    const order = await prisma.order.create({
      data: {
        user: { connect: { id: session.user.id } },
        totalCents: totalAmount,
        status: 'PENDING',
        // Customer Information
        customerName,
        customerEmail,
        customerPhone,
        // Delivery Information
        deliveryAddress,
        deliveryBuilding,
        deliveryHouse,
        deliveryFloor,
        deliveryCity,
        deliveryNotes,
        deliveryMethod: deliveryMethod || 'delivery',
        deliveryLatitude,
        deliveryLongitude,
        deliveryFee: deliveryFee || 0,
        deliveryZone,
        // General Notes
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceCents: item.priceCents,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update user rewards directly
    let rewardsData = null;
    try {
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

      // Spending bracket tiers
      const SPENDING_BRACKETS = [
        { minSpend: 0, maxSpend: 30000, rewardValue: 1000 },
        { minSpend: 30100, maxSpend: 50000, rewardValue: 2000 },
        { minSpend: 50100, maxSpend: 70000, rewardValue: 3000 },
        { minSpend: 70100, maxSpend: 90000, rewardValue: 4000 },
        { minSpend: 90100, maxSpend: 110000, rewardValue: 5000 },
        { minSpend: 110100, maxSpend: 130000, rewardValue: 6000 },
        { minSpend: 130100, maxSpend: 150000, rewardValue: 7000 },
        { minSpend: 150100, maxSpend: 190000, rewardValue: 8000 },
        { minSpend: 190100, maxSpend: 230000, rewardValue: 9000 },
        { minSpend: 230100, maxSpend: 300000, rewardValue: 10000 },
        { minSpend: 300000, maxSpend: Infinity, rewardValue: 0, customizable: true },
      ];

      // Update bracket tracking
      const newBracketReceipts = userRewards.currentBracketReceipts + 1;
      const newBracketSpend = userRewards.currentBracketSpend + totalAmount;
      
      let bracketCompleted = false;
      let bracketRewardAwarded = 0;

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
      }

      // Update total stats
      const newTotalSpend = userRewards.totalSpend + totalAmount;
      const newPurchaseCount = userRewards.purchaseCount + 1;

      // Update user rewards
      const updatedRewards = await prisma.userRewards.update({
        where: { userId: session.user.id },
        data: {
          totalSpend: newTotalSpend,
          purchaseCount: newPurchaseCount,
          currentBracketSpend: bracketCompleted ? 0 : newBracketSpend,
          currentBracketReceipts: bracketCompleted ? 0 : newBracketReceipts,
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

      rewardsData = {
        success: true,
        rewards: updatedRewards,
        bracketCompleted,
        bracketRewardAwarded,
        currentBracketProgress: {
          receipts: bracketCompleted ? 1 : newBracketReceipts,
          totalSpend: bracketCompleted ? totalAmount : newBracketSpend,
          maxReceipts: 10,
        },
        message: bracketCompleted 
          ? `🎉 Bracket Complete! You earned KES ${(bracketRewardAwarded / 100).toFixed(2)} Free!`
          : `Receipt ${newBracketReceipts}/10 - Spend so far: KES ${(newBracketSpend / 100).toFixed(2)}`,
      };
    } catch (rewardError) {
      console.error('Error updating rewards:', rewardError);
      // Don't fail the order if rewards fail
    }

    // 🎮 GAMIFICATION: Check and award badges after order creation
    let badgeNotification = null;
    try {
      const { checkAndAwardBadges } = await import('@/lib/gamification/badge-checker');
      const newBadges = await checkAndAwardBadges(session.user.id);
      
      if (newBadges.length > 0) {
        console.log(`🏅 User ${session.user.id} earned ${newBadges.length} new badge(s)!`);
        badgeNotification = {
          count: newBadges.length,
          badges: newBadges.map(ub => ({
            name: ub.badge.name,
            icon: ub.badge.icon,
            bonusPoints: ub.badge.bonusPoints
          }))
        };
      }
    } catch (badgeError) {
      console.error('Badge check error (non-critical):', badgeError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        totalCents: order.totalCents,
        itemCount: order.items.length,
        status: order.status,
      },
      rewards: rewardsData || null,
      badges: badgeNotification,
      message: 'Order created successfully! Your rewards have been updated.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
