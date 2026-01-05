import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // 1. Create Test User
    console.log('Creating test user...');
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+254712345678',
        phoneVerified: true,
      },
    });

    console.log('✅ Created test user:', testUser.name);

    // 2. Get products and create interactions
    console.log('Creating product interactions...');
    
    const products = await prisma.product.findMany({
      take: 10,
    });

    if (products.length > 0) {
      // Create product interactions for the user
      for (let i = 0; i < Math.min(5, products.length); i++) {
        const product = products[i];
        
        // View interaction
        await prisma.productInteraction.upsert({
          where: {
            userId_productId_actionType: {
              userId: testUser.id,
              productId: product.id,
              actionType: 'VIEW',
            },
          },
          update: {
            frequency: { increment: Math.floor(Math.random() * 3) + 1 },
            lastInteractionAt: new Date(),
          },
          create: {
            userId: testUser.id,
            productId: product.id,
            actionType: 'VIEW',
            frequency: Math.floor(Math.random() * 3) + 1,
          },
        });

        // Add some purchases
        if (i < 3) {
          await prisma.productInteraction.upsert({
            where: {
              userId_productId_actionType: {
                userId: testUser.id,
                productId: product.id,
                actionType: 'PURCHASE',
              },
            },
            update: {
              frequency: { increment: 1 },
              lastInteractionAt: new Date(),
            },
            create: {
              userId: testUser.id,
              productId: product.id,
              actionType: 'PURCHASE',
              frequency: 1,
            },
          });
        }

        // Add some to cart actions
        if (i < 4) {
          await prisma.productInteraction.upsert({
            where: {
              userId_productId_actionType: {
                userId: testUser.id,
                productId: product.id,
                actionType: 'ADD_TO_CART',
              },
            },
            update: {
              frequency: { increment: 1 },
              lastInteractionAt: new Date(),
            },
            create: {
              userId: testUser.id,
              productId: product.id,
              actionType: 'ADD_TO_CART',
              frequency: 1,
            },
          });
        }
      }

      console.log('✅ Created product interactions');
    }

    // 3. Create user preference
    console.log('Creating user preferences...');
    
    const categories = await prisma.category.findMany({ take: 3 });
    if (categories.length > 0) {
      await prisma.userPreference.upsert({
        where: { userId: testUser.id },
        update: {},
        create: {
          userId: testUser.id,
          preferredCategories: JSON.stringify(
            categories.map((c) => ({ id: c.id, weight: 1 }))
          ),
          preferredPriceRange: JSON.stringify({ min: 50, max: 5000 }),
          updateFrequency: 'DAILY',
          enableNotifications: true,
        },
      });

      console.log('✅ Created user preferences');
    }

    // 4. Create notifications
    console.log('Creating notifications...');
    
    const notificationTypes = [
      {
        type: 'NEW_ARRIVAL',
        title: 'New Pizza Available!',
        message: 'Margherita pizza has just been added to our menu. Order now!',
      },
      {
        type: 'RECOMMENDATION',
        title: 'We think you\'ll love this',
        message: 'Fresh mango juice - a customer favorite based on your preferences',
      },
      {
        type: 'PRICE_DROP',
        title: 'Price dropped!',
        message: 'Viazi Karai is now on sale - was 100 KES, now 70 KES!',
      },
      {
        type: 'BACK_IN_STOCK',
        title: 'Back in stock',
        message: 'Fresh yogurt is available again. Limited quantities!',
      },
      {
        type: 'NEW_ARRIVAL',
        title: 'New tropical smoothie',
        message: 'Try our new tropical smoothie - made with fresh fruits',
      },
    ];

    for (const notif of notificationTypes) {
      await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: Math.random() > 0.5,
        },
      });
    }

    console.log('✅ Created notifications');

    // 5. Create test orders
    console.log('Creating test orders...');
    
    const vendor = await prisma.vendor.findFirst();
    if (vendor && products.length > 0) {
      const order1 = await prisma.order.create({
        data: {
          userId: testUser.id,
          vendorId: vendor.id,
          status: 'COMPLETED',
          totalCents: 15000,
          customerName: testUser.name,
          customerEmail: testUser.email,
          customerPhone: testUser.phone,
          deliveryAddress: '123 Main Street, Nairobi',
          deliveryCity: 'Nairobi',
        },
      });

      // Add items to order
      for (let i = 0; i < Math.min(3, products.length); i++) {
        await prisma.orderItem.create({
          data: {
            orderId: order1.id,
            productId: products[i].id,
            quantity: Math.floor(Math.random() * 3) + 1,
            priceCents: products[i].priceCents,
          },
        });
      }

      // Create another order with pending status
      const order2 = await prisma.order.create({
        data: {
          userId: testUser.id,
          vendorId: vendor.id,
          status: 'PENDING',
          totalCents: 8500,
          customerName: testUser.name,
          customerEmail: testUser.email,
          customerPhone: testUser.phone,
          deliveryAddress: '456 Oak Ave, Nairobi',
          deliveryCity: 'Nairobi',
        },
      });

      // Add items to second order
      for (let i = 2; i < Math.min(5, products.length); i++) {
        await prisma.orderItem.create({
          data: {
            orderId: order2.id,
            productId: products[i].id,
            quantity: Math.floor(Math.random() * 2) + 1,
            priceCents: products[i].priceCents,
          },
        });
      }

      console.log('✅ Created test orders');
    }

    console.log('\n✨ Test data seeded successfully!');
    console.log('\n📝 Test Login Credentials:');
    console.log('  Email: test@example.com');
    console.log('  Phone: +254712345678');
    console.log('\n🔗 URLs to Visit:');
    console.log('  Home: http://localhost:3001');
    console.log('  Profile: http://localhost:3001/profile');
    console.log('  Orders Tab: http://localhost:3001/profile?tab=orders');
    console.log('  Notifications: http://localhost:3001/profile?tab=notifications');
    console.log('  Admin Promotions: http://localhost:3001/admin/promotions');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

seedTestData()
  .then(() => {
    console.log('\n✅ Done!');
  })
  .catch((error) => {
    console.error('Failed to seed:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
