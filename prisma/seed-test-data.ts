import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // 1. Create Test Promotions
    console.log('Creating promotions...');
    
    const promotions = await Promise.all([
      prisma.promotion.create({
        data: {
          title: 'Meet & Greet - VIP Event',
          description: 'Exclusive meet and greet with celebrity guests. Regular: 100 KES | VIP: 200 KES',
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
          type: 'EVENT',
          targetUrl: 'https://example.com/tickets',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      }),
      prisma.promotion.create({
        data: {
          title: '50% OFF - Flash Sale Weekend',
          description: 'Limited time only! Get up to 50% off on selected items this weekend',
          imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
          type: 'FLASH_SALE',
          targetUrl: 'https://example.com/flash-sale',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
      prisma.promotion.create({
        data: {
          title: 'New Restaurant Opening - Grand Launch',
          description: 'Join us for the grand opening of our new downtown restaurant! Special opening day discounts available',
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4d71bcdd2d59?w=800&q=80',
          type: 'ADVERTISEMENT',
          targetUrl: 'https://example.com/restaurant',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      }),
      prisma.promotion.create({
        data: {
          title: 'Summer Festival 2025',
          description: 'Experience the best of summer! Food, entertainment, and amazing deals. Get your tickets now!',
          imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
          type: 'PROMOTION',
          targetUrl: 'https://example.com/summer-festival',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        },
      }),
    ]);

    console.log(`✅ Created ${promotions.length} promotions`);

    // 2. Create Test User with Interactions and Notifications
    console.log('Creating test user with interactions...');
    
    // Get some products to interact with
    const products = await prisma.product.findMany({
      take: 10,
    });

    if (products.length > 0) {
      // Create a test user
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

      // Create product interactions for the user
      for (let i = 0; i < Math.min(5, products.length); i++) {
        const product = products[i];
        
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

      console.log('✅ Created product interactions for test user');

      // Create user preference
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

      // Create notifications for the user
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

      console.log('✅ Created notifications for test user');

      // Create a test order
      const vendor = await prisma.vendor.findFirst();
      if (vendor) {
        const order = await prisma.order.create({
          data: {
            userId: testUser.id,
            vendorId: vendor.id,
            status: 'COMPLETED',
            totalCents: 15000,
            customerName: testUser.name,
            customerEmail: testUser.email,
            customerPhone: testUser.phone,
            deliveryAddress: '123 Main Street',
            deliveryCity: 'Nairobi',
          },
        });

        // Add items to order
        for (let i = 0; i < Math.min(3, products.length); i++) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: products[i].id,
              quantity: Math.floor(Math.random() * 3) + 1,
              priceCents: products[i].priceCents,
            },
          });
        }

        console.log('✅ Created test order with items');
      }
    }

    console.log('\n✨ Test data seeded successfully!');
    console.log('\n📝 Test Login Credentials:');
    console.log('  Email: test@example.com');
    console.log('  Phone: +254712345678');
    console.log('\n🔗 URLs to Visit:');
    console.log('  Home: http://localhost:3001');
    console.log('  Profile: http://localhost:3001/profile');
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
