import { prisma } from '../lib/db';

async function seedRewards() {
  console.log('🎁 Seeding reward catalog...');

  const rewards = [
    {
      title: '100 KES Free Item',
      description: 'Get 100 KES to spend on any item',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
      value: 10000, // 100 KES in cents
      minSpend: 300000, // 3000 KES
      quantity: 50,
      isActive: true,
    },
    {
      title: '200 KES Discount Voucher',
      description: 'Redeem for 200 KES discount on next purchase',
      imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop',
      value: 20000, // 200 KES
      minSpend: 600000, // 6000 KES
      quantity: 40,
      isActive: true,
    },
    {
      title: '300 KES Premium Voucher',
      description: 'Premium reward with 300 KES value',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
      value: 30000, // 300 KES
      minSpend: 1000000, // 10000 KES
      quantity: 30,
      isActive: true,
    },
    {
      title: 'Free Meal Package',
      description: 'Complimentary meal package worth 500 KES',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      value: 50000, // 500 KES
      minSpend: 1500000, // 15000 KES
      quantity: 25,
      isActive: true,
    },
    {
      title: 'VIP Loyalty Card (1000 KES)',
      description: 'Exclusive VIP card with 1000 KES value and special perks',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=400&h=300&fit=crop',
      value: 100000, // 1000 KES
      minSpend: 2500000, // 25000 KES
      quantity: 15,
      isActive: true,
    },
    {
      title: 'Sunset Special Bundle',
      description: 'Mystery bundle of popular items (250 KES value)',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      value: 25000, // 250 KES
      minSpend: 750000, // 7500 KES
      quantity: 35,
      isActive: true,
    },
    {
      title: 'Birthday Special (150 KES)',
      description: 'Celebrate with 150 KES off on your birthday month',
      imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=300&fit=crop',
      value: 15000, // 150 KES
      minSpend: 500000, // 5000 KES
      quantity: 100,
      isActive: true,
    },
    {
      title: 'Friend Referral Bonus (200 KES)',
      description: 'Bonus for referring a friend - 200 KES credit',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      value: 20000, // 200 KES
      minSpend: 400000, // 4000 KES
      quantity: 50,
      isActive: true,
    },
  ];

  for (const reward of rewards) {
    try {
      const existing = await prisma.rewardCatalog.findFirst({
        where: { title: reward.title },
      });

      if (!existing) {
        await prisma.rewardCatalog.create({
          data: reward,
        });
        console.log(`✓ Created reward: ${reward.title}`);
      } else {
        console.log(`⊘ Reward already exists: ${reward.title}`);
      }
    } catch (error) {
      console.error(`✗ Error creating reward ${reward.title}:`, error);
    }
  }

  console.log('✓ Reward seeding complete!');
}

seedRewards()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
