import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Generate cuid-like ID
function generateId() {
  return 'c' + randomBytes(12).toString('base64').replace(/[+\/=]/g, '').toLowerCase().substring(0, 24);
}

async function seedReferralGamification() {
  console.log('🎮 Seeding Referral Gamification System...');

  // 1. Create Referral-Specific Badges
  console.log('Creating referral badges...');
  
  const badges = [
    {
      name: 'First Share',
      description: 'Shared your first referral link',
      icon: '🎁',
      category: 'REFERRAL',
      requirement: 1,
      bonusPoints: 50,
      tier: 'BRONZE',
    },
    {
      name: 'Social Butterfly',
      description: 'Successfully referred 5 friends',
      icon: '🦋',
      category: 'REFERRAL',
      requirement: 5,
      bonusPoints: 200,
      tier: 'BRONZE',
    },
    {
      name: 'Super Sharer',
      description: 'Successfully referred 10 friends',
      icon: '⭐',
      category: 'REFERRAL',
      requirement: 10,
      bonusPoints: 500,
      tier: 'SILVER',
    },
    {
      name: 'Brand Ambassador',
      description: 'Successfully referred 25 friends',
      icon: '🏆',
      category: 'REFERRAL',
      requirement: 25,
      bonusPoints: 1000,
      tier: 'GOLD',
    },
    {
      name: 'Brand Champion',
      description: 'Successfully referred 50 friends',
      icon: '👑',
      category: 'REFERRAL',
      requirement: 50,
      bonusPoints: 2500,
      tier: 'PLATINUM',
    },
    {
      name: 'Legend',
      description: 'Successfully referred 100 friends',
      icon: '💎',
      category: 'REFERRAL',
      requirement: 100,
      bonusPoints: 10000,
      tier: 'PLATINUM',
    },
  ];

  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({
      where: { name: badge.name },
    });
    
    if (existing) {
      await prisma.badge.update({
        where: { name: badge.name },
        data: badge,
      });
    } else {
      await prisma.badge.create({
        data: {
          ...badge,
          id: generateId(),
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log(`✅ Created ${badges.length} referral badges`);

  // 2. Create Referral Milestones
  console.log('Creating referral milestones...');

  const milestones = [
    {
      name: 'First Referral',
      description: 'Complete your first referral',
      icon: '🎯',
      type: 'REFERRALS',
      threshold: 1,
      rewardType: 'POINTS',
      rewardValue: 100,
      order: 1,
    },
    {
      name: '3 Referrals',
      description: 'Successfully refer 3 friends',
      icon: '🎪',
      type: 'REFERRALS',
      threshold: 3,
      rewardType: 'SPIN',
      rewardValue: 1,
      order: 2,
    },
    {
      name: '5 Referrals - Bronze Tier',
      description: 'Join the Bronze tier with 5 referrals',
      icon: '🥉',
      type: 'REFERRALS',
      threshold: 5,
      rewardType: 'POINTS',
      rewardValue: 500,
      order: 3,
    },
    {
      name: '10 Referrals - Silver Tier',
      description: 'Join the Silver tier with 10 referrals',
      icon: '🥈',
      type: 'REFERRALS',
      threshold: 10,
      rewardType: 'POINTS',
      rewardValue: 1500,
      order: 4,
    },
    {
      name: '20 Referrals - Gold Tier',
      description: 'Join the Gold tier with 20 referrals',
      icon: '🥇',
      type: 'REFERRALS',
      threshold: 20,
      rewardType: 'POINTS',
      rewardValue: 2500,
      order: 5,
    },
    {
      name: '50 Referrals - Platinum Tier',
      description: 'Join the elite Platinum tier',
      icon: '💎',
      type: 'REFERRALS',
      threshold: 50,
      rewardType: 'POINTS',
      rewardValue: 10000,
      order: 6,
    },
  ];

  for (const milestone of milestones) {
    const existing = await prisma.milestone.findFirst({
      where: { 
        type: milestone.type,
        threshold: milestone.threshold,
      },
    });
    
    if (existing) {
      await prisma.milestone.update({
        where: { id: existing.id },
        data: milestone,
      });
    } else {
      await prisma.milestone.create({
        data: {
          ...milestone,
          id: generateId(),
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log(`✅ Created ${milestones.length} referral milestones`);

  // 3. Create Spin Rewards
  console.log('Creating spin rewards...');

  const spinRewards = [
    {
      name: '50 Points',
      description: 'Earn 50 bonus points',
      icon: '💰',
      rewardType: 'POINTS',
      rewardValue: 50,
      probability: 30.0,
      color: '#FFD700',
    },
    {
      name: '100 Points',
      description: 'Earn 100 bonus points',
      icon: '💵',
      rewardType: 'POINTS',
      rewardValue: 100,
      probability: 25.0,
      color: '#FFA500',
    },
    {
      name: '250 Points',
      description: 'Earn 250 bonus points',
      icon: '💸',
      rewardType: 'POINTS',
      rewardValue: 250,
      probability: 15.0,
      color: '#FF6347',
    },
    {
      name: '500 Points',
      description: 'Earn 500 bonus points!',
      icon: '🎉',
      rewardType: 'POINTS',
      rewardValue: 500,
      probability: 5.0,
      color: '#FF1493',
    },
    {
      name: '1 Free Delivery',
      description: 'Get 1 free delivery',
      icon: '🚚',
      rewardType: 'FREE_DELIVERY',
      rewardValue: 1,
      probability: 15.0,
      color: '#4169E1',
    },
    {
      name: '10% Discount',
      description: 'Get 10% off your next order',
      icon: '🎫',
      rewardType: 'DISCOUNT',
      rewardValue: 10,
      probability: 8.0,
      color: '#32CD32',
    },
    {
      name: 'Better Luck',
      description: 'Try again next time!',
      icon: '🍀',
      rewardType: 'POINTS',
      rewardValue: 10,
      probability: 2.0,
      color: '#808080',
    },
  ];

  for (const reward of spinRewards) {
    const existing = await prisma.spinReward.findFirst({
      where: { name: reward.name },
    });
    
    if (existing) {
      await prisma.spinReward.update({
        where: { id: existing.id },
        data: reward,
      });
    } else {
      await prisma.spinReward.create({
        data: {
          ...reward,
          id: generateId(),
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log(`✅ Created ${spinRewards.length} spin rewards`);

  // 4. Create Rewards Store Items
  console.log('Creating rewards store items...');

  const rewardsStoreItems = [
    {
      name: '5% Discount Coupon',
      description: 'Get 5% off your next order',
      pointsCost: 100,
      type: 'DISCOUNT',
      value: 5,
      category: 'DISCOUNTS',
      displayOrder: 1,
      isFeatured: true,
    },
    {
      name: '10% Discount Coupon',
      description: 'Get 10% off your next order',
      pointsCost: 250,
      type: 'DISCOUNT',
      value: 10,
      category: 'DISCOUNTS',
      displayOrder: 2,
      isFeatured: true,
    },
    {
      name: '15% Discount Coupon',
      description: 'Get 15% off your next order',
      pointsCost: 400,
      type: 'DISCOUNT',
      value: 15,
      category: 'DISCOUNTS',
      displayOrder: 3,
    },
    {
      name: '20% Discount Coupon',
      description: 'Get 20% off your next order',
      pointsCost: 600,
      type: 'DISCOUNT',
      value: 20,
      category: 'DISCOUNTS',
      displayOrder: 4,
    },
    {
      name: '1 Free Delivery',
      description: 'Free delivery on your next order',
      pointsCost: 150,
      type: 'FREE_DELIVERY',
      value: 1,
      category: 'DELIVERIES',
      displayOrder: 5,
      isFeatured: true,
    },
    {
      name: '3 Free Deliveries',
      description: 'Free delivery on 3 orders',
      pointsCost: 400,
      type: 'FREE_DELIVERY',
      value: 3,
      category: 'DELIVERIES',
      displayOrder: 6,
    },
    {
      name: '5 Free Deliveries',
      description: 'Free delivery on 5 orders',
      pointsCost: 600,
      type: 'FREE_DELIVERY',
      value: 5,
      category: 'DELIVERIES',
      displayOrder: 7,
    },
    {
      name: 'KES 500 Gift Card',
      description: 'Redeem for KES 500 store credit',
      pointsCost: 1000,
      type: 'GIFT_CARD',
      value: 50000,
      category: 'SPECIAL',
      displayOrder: 8,
      isFeatured: true,
    },
    {
      name: 'KES 1000 Gift Card',
      description: 'Redeem for KES 1000 store credit',
      pointsCost: 1800,
      type: 'GIFT_CARD',
      value: 100000,
      category: 'SPECIAL',
      displayOrder: 9,
    },
    {
      name: 'Exclusive Badge',
      description: 'Unlock a special exclusive badge',
      pointsCost: 2500,
      type: 'BADGE',
      value: 1,
      category: 'SPECIAL',
      displayOrder: 10,
    },
  ];

  for (const item of rewardsStoreItems) {
    try {
      await prisma.rewardStoreItem.create({
        data: {
          ...item,
          id: generateId(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      // Skip if already exists
      console.log(`Skipping duplicate reward: ${item.name}`);
    }
  }

  console.log(`✅ Created ${rewardsStoreItems.length} rewards store items`);

  // 5. Create Monthly Referral Contest
  console.log('Creating referral contest...');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const contestName = `Monthly Referral Challenge - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  const existingContest = await prisma.contest.findFirst({
    where: { name: contestName },
  });
  
  if (!existingContest) {
    await prisma.contest.create({
      data: {
        id: generateId(),
        name: contestName,
        description: 'Refer the most friends this month and win amazing prizes! Top 3 referrers get special rewards.',
        type: 'REFERRAL',
        prizeType: 'POINTS',
        prizeValue: 5000,
        prizeDescription: '1st: 5000 points, 2nd: 3000 points, 3rd: 1000 points',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Created monthly referral contest');

  console.log('🎉 Referral Gamification System seeded successfully!');
}

seedReferralGamification()
  .catch((e) => {
    console.error('Error seeding referral gamification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
