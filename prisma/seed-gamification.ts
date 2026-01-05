import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Seeding gamification data...\n');

  // ========================================
  // 1. BADGES
  // ========================================
  console.log('🏅 Creating badges...');

  const badges = [
    // Purchase Badges
    { name: 'First Order', description: 'Welcome aboard! Your journey begins', icon: '🛍️', category: 'PURCHASE', requirement: 1, bonusPoints: 5000, tier: 'BRONZE' },
    { name: 'Getting Started', description: 'Completed 10 orders', icon: '🎉', category: 'PURCHASE', requirement: 10, bonusPoints: 10000, tier: 'BRONZE' },
    { name: 'Regular Customer', description: 'Completed 50 orders', icon: '💪', category: 'PURCHASE', requirement: 50, bonusPoints: 25000, tier: 'SILVER' },
    { name: 'VIP Member', description: 'Completed 100 orders', icon: '🌟', category: 'PURCHASE', requirement: 100, bonusPoints: 50000, tier: 'GOLD' },
    { name: 'Platinum Patron', description: 'Completed 500 orders', icon: '👑', category: 'PURCHASE', requirement: 500, bonusPoints: 100000, tier: 'PLATINUM' },
    
    // Spending Badges
    { name: 'Spender Initiate', description: 'Spent KES 1,000 total', icon: '💰', category: 'SPENDING', requirement: 100000, bonusPoints: 5000, tier: 'BRONZE' },
    { name: 'Big Spender', description: 'Spent KES 10,000 total', icon: '💵', category: 'SPENDING', requirement: 1000000, bonusPoints: 15000, tier: 'SILVER' },
    { name: 'Premium Customer', description: 'Spent KES 50,000 total', icon: '💎', category: 'SPENDING', requirement: 5000000, bonusPoints: 50000, tier: 'GOLD' },
    { name: 'Elite Buyer', description: 'Spent KES 100,000 total', icon: '🏆', category: 'SPENDING', requirement: 10000000, bonusPoints: 100000, tier: 'PLATINUM' },
    
    // Referral Badges
    { name: 'Brand Ambassador', description: 'Made your first referral', icon: '🤝', category: 'REFERRAL', requirement: 1, bonusPoints: 10000, tier: 'BRONZE' },
    { name: 'Super Sharer', description: 'Referred 5 friends', icon: '📣', category: 'REFERRAL', requirement: 5, bonusPoints: 20000, tier: 'SILVER' },
    { name: 'Influencer', description: 'Referred 10 friends', icon: '🚀', category: 'REFERRAL', requirement: 10, bonusPoints: 35000, tier: 'GOLD' },
    { name: 'Community Builder', description: 'Referred 50 friends', icon: '🌍', category: 'REFERRAL', requirement: 50, bonusPoints: 100000, tier: 'PLATINUM' },
    
    // Streak Badges
    { name: 'Consistency', description: 'Ordered 3 days in a row', icon: '🔥', category: 'STREAK', requirement: 3, bonusPoints: 5000, tier: 'BRONZE' },
    { name: 'Week Warrior', description: 'Ordered 7 days in a row', icon: '⚡', category: 'STREAK', requirement: 7, bonusPoints: 15000, tier: 'SILVER' },
    { name: 'Monthly Master', description: 'Ordered 30 days in a row', icon: '🎯', category: 'STREAK', requirement: 30, bonusPoints: 50000, tier: 'GOLD' },
    
    // Special Badges
    { name: 'Reviewer', description: 'Wrote your first product review', icon: '⭐', category: 'SPECIAL', requirement: 1, bonusPoints: 5000, tier: 'BRONZE' },
    { name: 'Early Bird', description: 'Placed order before 8 AM', icon: '🌅', category: 'SPECIAL', requirement: 1, bonusPoints: 3000, tier: 'BRONZE' },
    { name: 'Night Owl', description: 'Placed order after 10 PM', icon: '🌙', category: 'SPECIAL', requirement: 1, bonusPoints: 3000, tier: 'BRONZE' },
    { name: 'Weekend Shopper', description: 'Placed order on weekend', icon: '🎊', category: 'SPECIAL', requirement: 1, bonusPoints: 2000, tier: 'BRONZE' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }
  console.log(`✅ Created ${badges.length} badges\n`);

  // ========================================
  // 2. SPIN WHEEL REWARDS
  // ========================================
  console.log('🎡 Creating spin wheel rewards...');

  const spinRewards = [
    { name: '10 KES Reward', description: 'Bonus points added to account', icon: '🎁', rewardType: 'POINTS', rewardValue: 1000, probability: 30.0, color: '#FFD700' },
    { name: '25 KES Reward', description: 'Bonus points added to account', icon: '💰', rewardType: 'POINTS', rewardValue: 2500, probability: 25.0, color: '#FFA500' },
    { name: '50 KES Reward', description: 'Bonus points added to account', icon: '🎯', rewardType: 'POINTS', rewardValue: 5000, probability: 20.0, color: '#FF6347' },
    { name: '100 KES Reward', description: 'Bonus points added to account', icon: '⭐', rewardType: 'POINTS', rewardValue: 10000, probability: 15.0, color: '#4169E1' },
    { name: 'Free Delivery', description: 'Free delivery on next order', icon: '🚚', rewardType: 'FREE_DELIVERY', rewardValue: 10000, probability: 5.0, color: '#32CD32' },
    { name: '10% Discount', description: '10% off next order', icon: '💸', rewardType: 'DISCOUNT', rewardValue: 10, probability: 3.0, color: '#9370DB' },
    { name: '250 KES Jackpot', description: 'Big bonus points!', icon: '💎', rewardType: 'POINTS', rewardValue: 25000, probability: 1.5, color: '#FF1493' },
    { name: '500 KES MEGA WIN', description: 'MEGA bonus points!', icon: '👑', rewardType: 'POINTS', rewardValue: 50000, probability: 0.5, color: '#DC143C' },
  ];

  for (const reward of spinRewards) {
    await prisma.spinReward.create({
      data: reward,
    });
  }
  console.log(`✅ Created ${spinRewards.length} spin rewards\n`);

  // ========================================
  // 3. SAMPLE CONTEST
  // ========================================
  console.log('🏆 Creating sample contest...');

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  await prisma.contest.upsert({
    where: { id: 'sample-contest-1' },
    update: {},
    create: {
      id: 'sample-contest-1',
      name: 'Top Referrer of the Month',
      description: 'Refer the most friends this month and win KES 5,000!',
      type: 'REFERRAL',
      prizeType: 'CASH',
      prizeValue: 500000,
      prizeDescription: 'KES 5,000 cash prize + Platinum status for 3 months',
      startDate: now,
      endDate: endOfMonth,
      isActive: true,
      maxEntries: null,
    },
  });

  console.log('✅ Created sample contest\n');

  // ========================================
  // 4. MILESTONES
  // ========================================
  console.log('🎯 Creating milestones...');

  const milestones = [
    { name: 'First Purchase', description: 'Complete your first order', icon: '🎊', type: 'ORDERS', threshold: 1, rewardType: 'SPIN', rewardValue: 1, order: 1 },
    { name: '5 Orders Club', description: 'Complete 5 orders', icon: '🌟', type: 'ORDERS', threshold: 5, rewardType: 'SPIN', rewardValue: 2, order: 2 },
    { name: '25 Orders Milestone', description: 'Complete 25 orders', icon: '💪', type: 'ORDERS', threshold: 25, rewardType: 'POINTS', rewardValue: 25000, order: 3 },
    { name: 'Century Club', description: 'Complete 100 orders', icon: '🏅', type: 'ORDERS', threshold: 100, rewardType: 'POINTS', rewardValue: 100000, order: 4 },
    { name: 'KES 5K Spender', description: 'Spend KES 5,000 total', icon: '💰', type: 'SPENDING', threshold: 500000, rewardType: 'SPIN', rewardValue: 1, order: 5 },
    { name: 'KES 20K Spender', description: 'Spend KES 20,000 total', icon: '💵', type: 'SPENDING', threshold: 2000000, rewardType: 'POINTS', rewardValue: 50000, order: 6 },
    { name: 'Referral Master', description: 'Refer 3 friends', icon: '🎁', type: 'REFERRALS', threshold: 3, rewardType: 'SPIN', rewardValue: 3, order: 7 },
  ];

  for (const milestone of milestones) {
    await prisma.milestone.create({
      data: milestone,
    });
  }
  console.log(`✅ Created ${milestones.length} milestones\n`);

  console.log('🎉 Gamification seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding gamification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
