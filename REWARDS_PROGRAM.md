# 🎁 YADDPLAST Rewards Program

A comprehensive loyalty rewards system for the YADDPLAST e-commerce platform. Customers earn rewards with every purchase and can redeem them for discounts and special items.

## Program Overview

### Key Features

✅ **Purchase-Based Rewards** - Earn points with every purchase
✅ **Spending Thresholds** - Unlock rewards at certain spending milestones
✅ **Redemption Center** - Browse and claim rewards from catalog
✅ **Milestone Bonuses** - Get bonus rewards at major achievements
✅ **Stock Management** - Track and manage reward inventory
✅ **Transaction History** - Complete audit trail of all rewards activity

---

## Rewards Earning Rules

### Base Rewards
- **5% of every purchase** - Earn 50 KES reward for every 1000 KES spent
- Example: Purchase 2000 KES → Earn 100 KES in rewards

### Purchase Milestones
- **Every 10 purchases** - Earn 200 KES bonus
- Examples:
  - Purchase #10 → +200 KES
  - Purchase #20 → +200 KES
  - Purchase #30 → +200 KES

### Spending Milestones
- **5,000 KES total spent** → +500 KES bonus
- **10,000 KES total spent** → +1,000 KES bonus
- **25,000 KES total spent** → +2,500 KES bonus

### Example Calculation
```
Customer makes purchases:
- Purchase 1: 2,000 KES → Earn 100 KES (5%)
- Purchase 2: 3,000 KES → Earn 150 KES (5%)
  Total: 5,000 KES → +500 KES milestone bonus
  
Total earned so far: 750 KES
```

---

## Reward Catalog

### Available Rewards (Default)

| Title | Value | Min Spend | Stock | Description |
|-------|-------|-----------|-------|-------------|
| 100 KES Free Item | 100 KES | 3,000 KES | 50 | Get 100 KES to spend on any item |
| 200 KES Discount Voucher | 200 KES | 6,000 KES | 40 | 200 KES discount on next purchase |
| 300 KES Premium Voucher | 300 KES | 10,000 KES | 30 | Premium reward voucher |
| Free Meal Package | 500 KES | 15,000 KES | 25 | Complimentary meal package |
| VIP Loyalty Card | 1,000 KES | 25,000 KES | 15 | Exclusive VIP card with special perks |
| Sunset Special Bundle | 250 KES | 7,500 KES | 35 | Mystery bundle of popular items |
| Birthday Special | 150 KES | 5,000 KES | 100 | Birthday month discount |
| Friend Referral Bonus | 200 KES | 4,000 KES | 50 | Refer a friend bonus |

---

## API Endpoints

### 1. Get User Rewards Status
**GET** `/api/rewards/user`

Returns user's current rewards information.

```json
{
  "id": "user-rewards-id",
  "userId": "user-id",
  "totalSpend": 750000,        // 7,500 KES in cents
  "purchaseCount": 12,
  "pointsEarned": 75000,       // 750 KES in rewards
  "pointsRedeemed": 20000,     // 200 KES redeemed
  "lastPurchaseAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. Earn Rewards (Called on Order Placement)
**POST** `/api/rewards/earn`

Called when an order is placed to update user rewards.

**Request:**
```json
{
  "orderAmount": 250000  // 2,500 KES in cents
}
```

**Response:**
```json
{
  "success": true,
  "rewards": { /* updated rewards object */ },
  "pointsEarned": 12500,  // 125 KES
  "message": "You earned 125 KES in rewards!"
}
```

### 3. Get Reward Catalog
**GET** `/api/rewards/catalog`

Fetches all active rewards available for redemption.

```json
[
  {
    "id": "reward-id",
    "title": "100 KES Free Item",
    "description": "Get 100 KES to spend on any item",
    "imageUrl": "https://...",
    "value": 10000,        // 100 KES in cents
    "minSpend": 300000,    // 3,000 KES minimum
    "quantity": 50,        // Available stock
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 4. Redeem Reward
**POST** `/api/rewards/redeemed`

Redeems a reward and generates redemption code.

**Request:**
```json
{
  "rewardId": "reward-id"
}
```

**Response:**
```json
{
  "success": true,
  "redeemedReward": {
    "id": "redeemed-id",
    "userId": "user-id",
    "rewardId": "reward-id",
    "value": 10000,        // 100 KES
    "code": "REWARD-1705320000000-ABC123",
    "isUsed": false,
    "usedAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "reward": { /* reward details */ }
  },
  "message": "Successfully redeemed 100 KES Free Item! Use code REWARD-1705320000000-ABC123 to claim your reward."
}
```

### 5. Get Redeemed Rewards
**GET** `/api/rewards/redeemed`

Fetches all rewards redeemed by the user.

```json
[
  {
    "id": "redeemed-id",
    "userId": "user-id",
    "rewardId": "reward-id",
    "value": 10000,
    "code": "REWARD-1705320000000-ABC123",
    "isUsed": false,
    "usedAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "reward": { /* reward details */ }
  }
]
```

### 6. Create Reward (Admin)
**POST** `/api/rewards/catalog`

Creates a new reward item in the catalog.

**Request:**
```json
{
  "title": "100 KES Free Item",
  "description": "Get 100 KES to spend on any item",
  "imageUrl": "https://...",
  "value": 10000,        // 100 KES in cents
  "minSpend": 300000,    // 3,000 KES minimum
  "quantity": 100,
  "isActive": true
}
```

---

## User Interfaces

### 1. Rewards Dashboard (`/rewards`)

The customer-facing rewards page with three main tabs:

#### Dashboard Tab
- Shows total spend, purchase count, points earned, and available points
- Displays progress toward next reward
- Explains how the rewards program works
- Shows motivational messages

#### Catalog Tab
- Browse all available rewards
- Filter by spending threshold
- Shows reward value, description, and minimum spend requirement
- "Redeem Now" button (enabled only if user qualifies)
- Stock indicators (shows when items are running low)

#### Redeemed Tab
- View all previously redeemed rewards
- Shows redemption codes
- Displays status (Available/Used)
- Shows redemption dates

### 2. Admin Rewards Management (`/admin/rewards`)

Admin-only interface for managing the reward catalog.

**Features:**
- View all rewards in a table format
- Add new rewards with form validation
- See reward details: title, value, min spend, stock, status
- Track when rewards were created
- Status indicators for active/inactive rewards
- Stock level indicators

---

## Database Schema

### UserRewards Model
Tracks cumulative rewards for each user.

```prisma
model UserRewards {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  totalSpend      Int      @default(0)      // Total spent in cents
  purchaseCount   Int      @default(0)      // Number of purchases
  pointsEarned    Int      @default(0)      // Total reward value earned
  pointsRedeemed  Int      @default(0)      // Total reward value redeemed
  
  lastPurchaseAt  DateTime?
  updatedAt       DateTime @updatedAt
  createdAt       DateTime @default(now())
}
```

### RewardCatalog Model
Stores available rewards that customers can redeem.

```prisma
model RewardCatalog {
  id        String   @id @default(cuid())
  title     String
  description String?
  imageUrl  String?
  
  value     Int      @default(100)      // Value in KES (cents)
  minSpend  Int      @default(3000)     // Minimum spend in cents
  quantity  Int      @default(100)      // Stock available
  
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### RedeemedReward Model
Tracks individual reward redemptions.

```prisma
model RedeemedReward {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  rewardId    String
  reward      RewardCatalog @relation(fields: [rewardId], references: [id])
  
  value       Int      // Value redeemed in cents
  code        String   @unique // Redemption code
  
  isUsed      Boolean  @default(false)
  usedAt      DateTime?
  
  createdAt   DateTime @default(now())
}
```

### RewardTransactionLog Model
Audit trail of all rewards activity.

```prisma
model RewardTransactionLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        String   // "EARNED", "REDEEMED"
  amount      Int      // Amount in cents
  description String?
  
  createdAt   DateTime @default(now())
}
```

---

## Implementation Guide

### 1. Seeding the Database

Run the reward seeding script to populate default rewards:

```bash
npx ts-node prisma/seed-rewards.ts
```

This creates 8 sample rewards with varying values and spending thresholds.

### 2. Integrating with Order Placement

When an order is placed, call the rewards earning endpoint:

```typescript
// After order is created successfully
const rewardsResponse = await fetch('/api/rewards/earn', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderAmount: totalCents,
  }),
});
```

### 3. Displaying Rewards to Customers

Direct users to the rewards page:
- `/rewards` - Full rewards dashboard
- `/admin/rewards` - Admin management (admin only)

---

## Features & Capabilities

### ✅ Implemented
- [x] Purchase-based rewards earning
- [x] Spending milestone bonuses
- [x] Purchase count milestones
- [x] Reward redemption with code generation
- [x] Stock management and availability checking
- [x] User rewards dashboard
- [x] Redemption history tracking
- [x] Admin reward catalog management
- [x] Transaction logging
- [x] Form validation and error handling
- [x] Responsive UI design

### 📋 Future Enhancements
- [ ] Email notifications for rewards earned
- [ ] QR code scanning for redemption
- [ ] Reward expiration dates
- [ ] Tiered loyalty levels (Bronze/Silver/Gold/Platinum)
- [ ] Birthday month bonus rewards
- [ ] Referral program integration
- [ ] Analytics dashboard for reward usage
- [ ] Reward customization by vendor
- [ ] Time-limited flash rewards

---

## Error Handling

### Common Error Cases

| Error | Status | Solution |
|-------|--------|----------|
| User not authenticated | 401 | Redirect to login |
| Insufficient spend | 400 | Show remaining amount needed |
| Reward out of stock | 400 | Show "Out of Stock" message |
| Reward inactive | 400 | Show "No longer available" |
| Invalid reward ID | 404 | Show "Reward not found" |
| Order amount invalid | 400 | Validate order before calling API |

---

## Testing

### Manual Testing Checklist

- [ ] Create test user account
- [ ] Place test orders and verify rewards earned
- [ ] Check UserRewards table updates correctly
- [ ] Redeem available rewards
- [ ] Verify redemption codes are unique
- [ ] Check reward stock decrements
- [ ] Test spending threshold unlocks
- [ ] Test purchase milestone bonuses
- [ ] View redeemed rewards list
- [ ] Test admin reward creation
- [ ] Verify validation errors display correctly

---

## Support & Troubleshooting

### Common Issues

**Rewards not appearing after order**
- Check that `/api/rewards/earn` is called after order creation
- Verify user session is authenticated
- Check database connection

**Redemption code not generating**
- Ensure user has sufficient spending
- Check reward stock availability
- Verify reward is active (isActive: true)

**Admin rewards page not loading**
- Verify user has admin access
- Check authentication session
- Review console for errors

---

## Contact & Support

For issues or feature requests, contact the development team.

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0  
**Status:** Production Ready
