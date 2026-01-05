# 🎁 Spending Bracket Rewards System

## Overview

The Spending Bracket Rewards system is a tiered loyalty program that rewards customers based on their total spending across a fixed set of 10 receipts/orders. This system is inspired by the Yaddis restaurant loyalty card and provides increasing rewards as customers spend more within each bracket.

## How It Works

### Bracket Structure
Each bracket consists of **10 receipts (orders)**. After collecting 10 receipts, the customer's total spending in that bracket is calculated, and they receive a reward based on the spending tier.

### Spending Tiers & Rewards

| Receipt Range | Spending Range | Reward Value |
|---|---|---|
| 1-10 | Below KES 300 | 10 KES Free |
| 1-10 | KES 301-500 | 20 KES Free |
| 1-10 | KES 501-700 | 30 KES Free |
| 1-10 | KES 701-900 | 40 KES Free |
| 1-10 | KES 901-1,100 | 50 KES Free |
| 1-10 | KES 1,101-1,300 | 60 KES Free |
| 1-10 | KES 1,301-1,500 | 70 KES Free |
| 1-10 | KES 1,501-1,900 | 80 KES Free |
| 1-10 | KES 1,901-2,300 | 90 KES Free |
| 1-10 | KES 2,301-3,000 | 100 KES Free |
| 1-10 | Above KES 3,000 | Customized |

### Example Flow

**User Makes 10 Orders:**
```
Receipt 1: KES 25  → Running Total: KES 25
Receipt 2: KES 30  → Running Total: KES 55
Receipt 3: KES 20  → Running Total: KES 75
Receipt 4: KES 35  → Running Total: KES 110
Receipt 5: KES 40  → Running Total: KES 150
Receipt 6: KES 35  → Running Total: KES 185
Receipt 7: KES 25  → Running Total: KES 210
Receipt 8: KES 30  → Running Total: KES 240
Receipt 9: KES 40  → Running Total: KES 280
Receipt 10: KES 35 → Running Total: KES 315 ✨ BRACKET COMPLETE!
```

**Reward Calculation:**
- Total Spent in Bracket: KES 315
- Bracket Tier: KES 301-500 range
- **Reward Earned: 20 KES Free**

The bracket then resets, and the user starts collecting receipts toward the next bracket reward.

## Database Schema Changes

### UserRewards Model Updates

Added three new fields to track bracket progress:

```prisma
model UserRewards {
  // ... existing fields ...
  
  // Spending Bracket Tracking
  currentBracketSpend    Int      @default(0)      // Spend in current 10-receipt bracket (cents)
  currentBracketReceipts Int      @default(0)      // Number of receipts in current bracket
  bracketRewardAwarded   Int      @default(0)      // Amount awarded for completing bracket (cents)
}
```

## API Endpoints

### POST /api/rewards/earn
Called when an order is placed to update user rewards and bracket progress.

**Request:**
```json
{
  "orderAmount": 3500  // Amount in cents (KES 35)
}
```

**Response (Bracket Not Complete):**
```json
{
  "success": true,
  "rewards": {
    "userId": "user123",
    "totalSpend": 28500,
    "purchaseCount": 9,
    "pointsEarned": 2000,
    "currentBracketSpend": 28500,
    "currentBracketReceipts": 9,
    "bracketRewardAwarded": 0
  },
  "bracketCompleted": false,
  "bracketRewardAwarded": 0,
  "currentBracketProgress": {
    "receipts": 9,
    "totalSpend": 28500,
    "maxReceipts": 10
  },
  "message": "Receipt 9/10 - Spend so far: KES 285.00"
}
```

**Response (Bracket Complete):**
```json
{
  "success": true,
  "rewards": {
    "userId": "user123",
    "totalSpend": 31500,
    "purchaseCount": 10,
    "pointsEarned": 3000,
    "currentBracketSpend": 0,
    "currentBracketReceipts": 0,
    "bracketRewardAwarded": 0
  },
  "bracketCompleted": true,
  "bracketRewardAwarded": 3000,
  "currentBracketProgress": {
    "receipts": 1,
    "totalSpend": 3500,
    "maxReceipts": 10
  },
  "message": "🎉 Bracket Complete! You earned KES 30.00 Free!"
}
```

### GET /api/rewards/earn/brackets
Returns the bracket configuration and reward structure.

**Response:**
```json
{
  "success": true,
  "brackets": [
    {
      "minSpend": 0,
      "maxSpend": 30000,
      "rewardValue": 1000,
      "customizable": false
    },
    // ... more brackets ...
  ]
}
```

## UI Components

### Spending Bracket Dashboard
The rewards page displays:

1. **Current Bracket Stats:**
   - Receipts Collected (X/10)
   - Current Bracket Spend
   - Potential Reward (calculated from current spending)

2. **Receipt Progress Bar:**
   - Visual indicator of progress toward 10 receipts
   - Updates in real-time as orders are placed

3. **Spending Bracket Info:**
   - Quick reference showing all tier levels
   - Helps users understand rewards structure

## Implementation Details

### Receipt Tracking
- Each order increments `currentBracketReceipts` by 1
- Each order adds its amount to `currentBracketSpend`
- Bracket completes automatically when `currentBracketReceipts` reaches 10

### Reward Calculation
When bracket completes:
1. Find the spending tier matching `currentBracketSpend`
2. Get the `rewardValue` for that tier
3. Add to `pointsEarned`
4. Reset bracket counters to 0
5. Log transaction in `RewardTransactionLog`

### Bracket Reset
After a bracket completes:
- `currentBracketSpend` → 0
- `currentBracketReceipts` → 0
- `currentBracketReceipts` starts at 1 (first order of new bracket)
- `currentBracketSpend` set to the new order amount

## Frontend Features

### Rewards Page Enhancements
- Real-time bracket progress tracking
- Visual progress bar showing receipt count
- Spending tier display
- Potential reward calculation based on current spending
- Completion notifications

### User Experience
- Clear visualization of progress toward next reward
- Understanding of how much more to spend to reach next tier
- Celebration message when bracket completes
- Historical view of all earned rewards

## Integration with Checkout

When an order is placed:
1. Order is created and stored in database
2. `/api/rewards/earn` endpoint is called with order amount
3. Bracket tracking is updated
4. If bracket completes, reward is added to `pointsEarned`
5. User sees appropriate message based on bracket status

## Testing

### Test Cases
```javascript
// Test: Below 300 KES
Spend: KES 250 → Reward: KES 10 ✓

// Test: 301-500 KES
Spend: KES 400 → Reward: KES 20 ✓

// Test: 501-700 KES
Spend: KES 600 → Reward: KES 30 ✓

// Test: 900+ KES
Spend: KES 1000 → Reward: KES 50 ✓
```

## Migration Guide

### Step 1: Update Database Schema
```bash
npx prisma migrate dev --name add_spending_brackets
```

### Step 2: Deploy Changes
1. Update `/ecommerce-store/prisma/schema.prisma` ✓
2. Deploy migration to production database
3. Update API routes ✓
4. Update frontend components ✓

### Step 3: Data Migration
Existing users will:
- Start with `currentBracketSpend = 0`
- Have `currentBracketReceipts = 0` (reset to first order of new bracket)
- Continue earning rewards from next order onward

## Future Enhancements

1. **VIP Tier:** Bonus multipliers for spending above certain thresholds
2. **Streak Bonuses:** Extra rewards for consecutive brackets
3. **Seasonal Boosters:** Double rewards during special periods
4. **Referral Integration:** Share bracket progress with friends
5. **Mobile App Widget:** Quick bracket status on home screen

## Support & FAQs

### Q: What happens if I don't complete a bracket?
A: Your progress carries over! Each receipt you collect counts toward the bracket. You can take as long as you need.

### Q: Can I see my bracket progress anytime?
A: Yes! Visit the Rewards section to see:
- Current bracket receipts (X/10)
- Total spending in current bracket
- Potential reward based on spending

### Q: What if I spend exactly on the bracket boundary?
A: We use inclusive ranges. For example:
- KES 301-500 includes KES 301 to KES 500
- KES 501-700 starts from KES 501

### Q: How do I redeem my bracket reward?
A: Once your bracket completes, the reward is automatically added to your available points. You can redeem it from the Reward Catalog.
