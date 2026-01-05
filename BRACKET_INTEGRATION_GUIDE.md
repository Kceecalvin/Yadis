# Integration Guide - Spending Bracket Rewards

## Overview

This guide explains how to integrate the spending bracket rewards system into your checkout and order processing workflows.

## Checkout Flow Integration

### Step 1: Order Creation
When a user completes checkout and creates an order:

```typescript
// In your checkout API route
const order = await prisma.order.create({
  data: {
    vendorId: vendorId,
    userId: session.user.id,
    totalCents: cartTotal,
    status: 'PENDING',
    items: {
      create: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        priceCents: item.price,
      })),
    },
  },
});
```

### Step 2: Trigger Rewards Endpoint
After order is created, call the rewards endpoint:

```typescript
// Call rewards earning endpoint
const rewardsResponse = await fetch('/api/rewards/earn', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderAmount: cartTotal, // in cents
  }),
});

const rewardsData = await rewardsResponse.json();

// Handle bracket completion
if (rewardsData.bracketCompleted) {
  console.log(`🎉 Bracket complete! Earned: KES ${rewardsData.bracketRewardAwarded / 100}`);
  // Show success message to user
} else {
  console.log(`Receipt ${rewardsData.currentBracketProgress.receipts}/10`);
  // Show progress message to user
}
```

### Step 3: Display Feedback to User

```typescript
export default function OrderConfirmation({ orderId, rewardsData }) {
  return (
    <div className="order-confirmation">
      <h1>Order Confirmed!</h1>
      
      {/* Standard order info */}
      <OrderDetails orderId={orderId} />
      
      {/* Bracket Rewards Section */}
      <div className="rewards-section">
        {rewardsData.bracketCompleted ? (
          <div className="bracket-complete-banner">
            <h3>🎉 Bracket Complete!</h3>
            <p>You earned <strong>KES {(rewardsData.bracketRewardAwarded / 100).toFixed(0)} Free</strong></p>
            <p>Your new bracket has started. Keep shopping to earn more!</p>
          </div>
        ) : (
          <div className="bracket-progress-banner">
            <h3>📊 Bracket Progress</h3>
            <p>Receipt: {rewardsData.currentBracketProgress.receipts}/10</p>
            <p>Spend so far: KES {(rewardsData.currentBracketProgress.totalSpend / 100).toFixed(0)}</p>
            <ProgressBar 
              current={rewardsData.currentBracketProgress.receipts} 
              total={10} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

## Backend Integration Examples

### Example 1: Complete Checkout Process

```typescript
// app/api/orders/create/route.ts
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

export async function POST(request: Request) {
  const session = await getServerSession();
  const { items, deliveryDetails } = await request.json();

  // Calculate total
  const totalCents = items.reduce((sum, item) => 
    sum + (item.priceCents * item.quantity), 0
  );

  // Create order
  const order = await prisma.order.create({
    data: {
      vendorId: items[0].vendorId,
      userId: session.user.id,
      totalCents,
      status: 'PENDING',
      deliveryAddress: deliveryDetails.address,
      deliveryBuilding: deliveryDetails.building,
      deliveryHouse: deliveryDetails.house,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
  });

  // Update rewards
  const rewardsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/rewards/earn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderAmount: totalCents,
    }),
    // Use server session
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
    },
  });

  const rewardsData = await rewardsResponse.json();

  return Response.json({
    order,
    rewards: rewardsData,
  });
}
```

### Example 2: Batch Process Historical Orders

If you need to migrate existing orders and recalculate brackets:

```typescript
// This is for admin/dev purposes
async function recalculateBracketsForUser(userId: string) {
  // Get all orders for user
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  let currentBracketSpend = 0;
  let currentBracketReceipts = 0;
  let totalPointsEarned = 0;

  const SPENDING_BRACKETS = [
    { minSpend: 0, maxSpend: 30000, rewardValue: 1000 },
    { minSpend: 30100, maxSpend: 50000, rewardValue: 2000 },
    // ... rest of brackets
  ];

  for (const order of orders) {
    currentBracketReceipts++;
    currentBracketSpend += order.totalCents;

    if (currentBracketReceipts >= 10) {
      // Find bracket and add reward
      const bracket = SPENDING_BRACKETS.find(
        b => currentBracketSpend >= b.minSpend && currentBracketSpend <= b.maxSpend
      );

      if (bracket) {
        totalPointsEarned += bracket.rewardValue;
      }

      // Reset bracket
      currentBracketSpend = 0;
      currentBracketReceipts = 0;
    }
  }

  // Update user rewards
  await prisma.userRewards.update({
    where: { userId },
    data: {
      pointsEarned: totalPointsEarned,
    },
  });
}
```

## Frontend Integration Examples

### Example 1: Real-Time Bracket Updates

```typescript
// hooks/useRewardsBracket.ts
import { useEffect, useState } from 'react';

export function useRewardsBracket(userId: string) {
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBracketData = async () => {
      const response = await fetch('/api/rewards/user');
      const data = await response.json();
      setBracket({
        receipts: data.currentBracketReceipts,
        spend: data.currentBracketSpend,
        maxReceipts: 10,
      });
      setLoading(false);
    };

    fetchBracketData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchBracketData, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return { bracket, loading };
}
```

### Example 2: Bracket Progress Component

```typescript
// components/BracketProgress.tsx
import { useRewardsBracket } from '@/hooks/useRewardsBracket';

export function BracketProgress({ userId }: { userId: string }) {
  const { bracket, loading } = useRewardsBracket(userId);

  if (loading) return <div>Loading bracket data...</div>;

  const progress = (bracket.receipts / bracket.maxReceipts) * 100;
  const nextTierKes = calculateNextTier(bracket.spend);

  return (
    <div className="bracket-progress">
      <div className="stats">
        <div className="stat">
          <span className="label">Receipts</span>
          <span className="value">{bracket.receipts}/{bracket.maxReceipts}</span>
        </div>
        <div className="stat">
          <span className="label">Spend</span>
          <span className="value">KES {(bracket.spend / 100).toFixed(0)}</span>
        </div>
        <div className="stat">
          <span className="label">Next Tier In</span>
          <span className="value">KES {nextTierKes}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="tier-info">
        <p className="current-tier">
          You're in: {getCurrentTier(bracket.spend)} tier
        </p>
        <p className="hint">
          {bracket.receipts}/10 receipts collected
        </p>
      </div>
    </div>
  );
}
```

## Error Handling

### Common Scenarios

```typescript
// Scenario 1: User not authenticated
if (!session?.user?.id) {
  return { error: 'Please log in to earn rewards' };
}

// Scenario 2: Invalid order amount
if (!orderAmount || orderAmount <= 0) {
  return { error: 'Invalid order amount' };
}

// Scenario 3: Database error
try {
  const rewards = await updateUserRewards(userId, orderAmount);
} catch (error) {
  console.error('Rewards update failed:', error);
  // Still complete order, but log the error
  return { order, warningMessage: 'Rewards update pending' };
}
```

## Testing the Integration

### Test Case 1: Single Order
```bash
# Place one order worth KES 100
# Expected: Receipt 1/10, Spend: KES 100
```

### Test Case 2: Multiple Orders
```bash
# Place 9 orders worth KES 50 each = KES 450 total
# Expected: Receipt 9/10, Spend: KES 450
```

### Test Case 3: Bracket Completion
```bash
# Place 10th order worth KES 50
# Expected: Bracket Complete, 301-500 tier = 20 KES Free
# New bracket starts: Receipt 1/10, Spend: KES 0
```

### Test Case 4: High Spender
```bash
# Place 10 orders worth KES 300 each = KES 3000 total
# Expected: Bracket Complete, Above 3k tier = Customized
```

## Monitoring & Debugging

### Log Bracket Events

```typescript
// Add logging to track bracket progress
if (bracketCompleted) {
  console.log(`[BRACKET_COMPLETE] User: ${userId}, Spend: ${newBracketSpend}, Reward: ${bracketRewardAwarded}`);
  
  // Log to analytics
  analytics.track('bracket_complete', {
    userId,
    spend: newBracketSpend,
    reward: bracketRewardAwarded,
    tier: getTierName(newBracketSpend),
  });
}
```

### Database Queries for Debugging

```sql
-- Check user's bracket progress
SELECT 
  id, 
  currentBracketReceipts, 
  currentBracketSpend, 
  pointsEarned 
FROM "UserRewards" 
WHERE userId = 'user-123';

-- Find users close to bracket completion
SELECT 
  userId, 
  currentBracketReceipts, 
  currentBracketSpend 
FROM "UserRewards" 
WHERE currentBracketReceipts >= 8 
ORDER BY currentBracketReceipts DESC;
```

---

## Quick Reference

### API Endpoint
- **POST** `/api/rewards/earn` - Record order and update bracket
- **GET** `/api/rewards/earn/brackets` - Get bracket configuration

### Database Fields
- `currentBracketSpend` - Total spent in current bracket (cents)
- `currentBracketReceipts` - Number of orders in current bracket
- `bracketRewardAwarded` - Amount awarded (for display)

### Bracket Constants
- **Max Receipts:** 10
- **Min Spend:** KES 0
- **Max Spend (Tier 10):** KES 3000+
- **Reward Range:** KES 10 - KES 100+ Free

---

For more information, see **SPENDING_BRACKET_REWARDS.md**
