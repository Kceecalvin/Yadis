import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Check for a simple secret key to prevent unauthorized seeding
    const { secret } = await request.json();
    
    if (secret !== process.env.SEED_SECRET && secret !== 'dev-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear existing data (optional - comment out if you want to keep data)
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});

    // Create categories
    const foodCategory = await prisma.category.create({
      data: {
        slug: 'food',
        titleEn: 'Food',
        titleSw: 'Chakula',
        section: 'FOOD',
      },
    });

    const drinksCategory = await prisma.category.create({
      data: {
        slug: 'drinks',
        titleEn: 'Drinks',
        titleSw: 'Vinywaji',
        section: 'FOOD',
      },
    });

    // Create products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          slug: 'ugali',
          nameEn: 'Ugali',
          nameSw: 'Ugali',
          descriptionEn: 'Traditional Kenyan staple made from maize flour',
          descriptionSw: 'Chakula kikuu cha Kikenya kilichotengenezwa kwa unga wa mahindi',
          priceCents: 15000, // 150 KES
          imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
          categoryId: foodCategory.id,
          inStock: true,
        },
      }),
      prisma.product.create({
        data: {
          slug: 'nyama-choma',
          nameEn: 'Nyama Choma',
          nameSw: 'Nyama Choma',
          descriptionEn: 'Grilled meat, a Kenyan favorite',
          descriptionSw: 'Nyama ya kuchomwa, kipendwa cha Wakenya',
          priceCents: 50000, // 500 KES
          imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462',
          categoryId: foodCategory.id,
          inStock: true,
        },
      }),
      prisma.product.create({
        data: {
          slug: 'chapati',
          nameEn: 'Chapati',
          nameSw: 'Chapati',
          descriptionEn: 'Soft flatbread',
          descriptionSw: 'Mkate laini',
          priceCents: 5000, // 50 KES
          imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
          categoryId: foodCategory.id,
          inStock: true,
        },
      }),
      prisma.product.create({
        data: {
          slug: 'tusker-beer',
          nameEn: 'Tusker Beer',
          nameSw: 'Bia ya Tusker',
          descriptionEn: 'Kenyan lager beer',
          descriptionSw: 'Bia ya Kikenya',
          priceCents: 25000, // 250 KES
          imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9',
          categoryId: drinksCategory.id,
          inStock: true,
        },
      }),
      prisma.product.create({
        data: {
          slug: 'passion-juice',
          nameEn: 'Passion Fruit Juice',
          nameSw: 'Maji ya Maracuja',
          descriptionEn: 'Fresh passion fruit juice',
          descriptionSw: 'Maji ya maracuja safi',
          priceCents: 10000, // 100 KES
          imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696',
          categoryId: drinksCategory.id,
          inStock: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        categories: 2,
        products: products.length,
      },
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request with { "secret": "dev-seed-2024" } to seed the database',
  });
}
