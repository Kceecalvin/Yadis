import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Restoring Products to Your Vendor...\n');
  
  // Get your vendor
  const vendor = await prisma.vendor.findUnique({
    where: { slug: 'kutus-general-store' }
  });
  
  if (!vendor) {
    console.log('❌ Vendor not found!');
    return;
  }
  
  console.log(`✅ Found vendor: ${vendor.name}\n`);
  
  // Get categories
  const categories = await prisma.category.findMany();
  const foodCategories = categories.filter(c => c.section === 'FOOD');
  const plasticsCategories = categories.filter(c => c.section === 'PLASTICS');
  
  const hotMeals = foodCategories.find(c => c.slug === 'hot-meals');
  const iceCream = foodCategories.find(c => c.slug === 'ice-cream');
  const snacks = foodCategories.find(c => c.slug === 'snacks');
  const cakesPizza = foodCategories.find(c => c.slug === 'cakes-pastries-pizza');
  const yogurtJuice = foodCategories.find(c => c.slug === 'yogurt-juices');
  
  const buckets = plasticsCategories.find(c => c.slug === 'buckets');
  const chairs = plasticsCategories.find(c => c.slug === 'plastic-chairs');
  const brooms = plasticsCategories.find(c => c.slug === 'brooms');
  const spoons = plasticsCategories.find(c => c.slug === 'plastic-spoons');
  const potties = plasticsCategories.find(c => c.slug === 'baby-potties');
  
  // Products to create
  const products = [
    // Food - Hot Meals
    {
      slug: 'chips-masala',
      nameEn: 'Chips Masala',
      nameSw: 'Chipsi Masala',
      descriptionEn: 'Delicious fried chips with masala spices',
      descriptionSw: 'Chipsi za kukaanga zenye viungo vya masala',
      priceCents: 15000,
      imageUrl: '/images/food/chips-masala.svg',
      categoryId: hotMeals?.id,
    },
    {
      slug: 'pilau',
      nameEn: 'Pilau',
      nameSw: 'Pilau',
      descriptionEn: 'Traditional spiced rice dish',
      descriptionSw: 'Wali wenye viungo vya kipekee',
      priceCents: 20000,
      imageUrl: '/images/food/pilau.svg',
      categoryId: hotMeals?.id,
    },
    {
      slug: 'biriyani',
      nameEn: 'Biriyani',
      nameSw: 'Biriyani',
      descriptionEn: 'Aromatic spiced rice with meat',
      descriptionSw: 'Wali wenye viungo na nyama',
      priceCents: 25000,
      imageUrl: '/images/food/biriyani.svg',
      categoryId: hotMeals?.id,
    },
    {
      slug: 'viazi-karai',
      nameEn: 'Viazi Karai',
      nameSw: 'Viazi Karai',
      descriptionEn: 'Spicy fried potatoes',
      descriptionSw: 'Viazi vya kukaanga zenye pilipili',
      priceCents: 10000,
      imageUrl: '/images/food/viazi-karai.svg',
      categoryId: hotMeals?.id,
    },
    {
      slug: 'chapo',
      nameEn: 'Chapati',
      nameSw: 'Chapo',
      descriptionEn: 'Soft flatbread',
      descriptionSw: 'Mkate laini',
      priceCents: 2000,
      imageUrl: '/images/food/chapo.svg',
      categoryId: hotMeals?.id,
    },
    
    // Food - Ice Cream
    {
      slug: 'vanilla-ice-cream',
      nameEn: 'Vanilla Ice Cream',
      nameSw: 'Aiskrimu ya Vanilla',
      descriptionEn: 'Creamy vanilla ice cream',
      descriptionSw: 'Aiskrimu ya vanilla laini',
      priceCents: 15000,
      imageUrl: '/images/food/vanilla-ice-cream.svg',
      categoryId: iceCream?.id,
    },
    
    // Food - Snacks
    {
      slug: 'crisps',
      nameEn: 'Crisps',
      nameSw: 'Crisps',
      descriptionEn: 'Crunchy potato crisps',
      descriptionSw: 'Crisps za viazi',
      priceCents: 5000,
      imageUrl: '/images/food/crisps.svg',
      categoryId: snacks?.id,
    },
    
    // Food - Cakes & Pizza
    {
      slug: 'margherita-pizza',
      nameEn: 'Margherita Pizza',
      nameSw: 'Pizza ya Margherita',
      descriptionEn: 'Classic cheese and tomato pizza',
      descriptionSw: 'Pizza ya jizi na nyanya',
      priceCents: 50000,
      imageUrl: '/images/food/margherita-pizza.svg',
      categoryId: cakesPizza?.id,
    },
    
    // Food - Yogurt & Juices
    {
      slug: 'fresh-yogurt',
      nameEn: 'Fresh Yogurt',
      nameSw: 'Mtindi Safi',
      descriptionEn: 'Fresh natural yogurt',
      descriptionSw: 'Mtindi asilia safi',
      priceCents: 12000,
      imageUrl: '/images/food/fresh-yogurt.svg',
      categoryId: yogurtJuice?.id,
    },
    {
      slug: 'mango-juice',
      nameEn: 'Mango Juice',
      nameSw: 'Juice ya Embe',
      descriptionEn: 'Fresh mango juice',
      descriptionSw: 'Juice ya embe safi',
      priceCents: 10000,
      imageUrl: '/images/food/mango-juice.svg',
      categoryId: yogurtJuice?.id,
    },
    
    // Household - Buckets
    {
      slug: 'deluxe-bucket-20l',
      nameEn: 'Deluxe Bucket 20L',
      nameSw: 'Ndoo ya Deluxe 20L',
      descriptionEn: 'High quality 20 liter bucket',
      descriptionSw: 'Ndoo ya ubora wa juu ya lita 20',
      priceCents: 50000,
      imageUrl: '/images/plastics/deluxe-bucket.svg',
      categoryId: buckets?.id,
    },
    
    // Household - Chairs
    {
      slug: 'plastic-chair',
      nameEn: 'Plastic Chair',
      nameSw: 'Kiti cha Plastiki',
      descriptionEn: 'Comfortable plastic chair',
      descriptionSw: 'Kiti cha plastiki chenye starehe',
      priceCents: 80000,
      imageUrl: '/images/plastics/plastic-chair.svg',
      categoryId: chairs?.id,
    },
    
    // Household - Brooms
    {
      slug: 'soft-broom',
      nameEn: 'Soft Broom',
      nameSw: 'Ufagio Laini',
      descriptionEn: 'Soft bristle broom',
      descriptionSw: 'Ufagio wenye manyoya laini',
      priceCents: 25000,
      imageUrl: '/images/plastics/soft-broom.svg',
      categoryId: brooms?.id,
    },
    
    // Household - Spoons
    {
      slug: 'plastic-spoons',
      nameEn: 'Plastic Spoons Set',
      nameSw: 'Vijiko vya Plastiki',
      descriptionEn: 'Set of plastic spoons',
      descriptionSw: 'Seti ya vijiko vya plastiki',
      priceCents: 15000,
      imageUrl: '/images/plastics/plastic-spoons.svg',
      categoryId: spoons?.id,
    },
    
    // Household - Potties
    {
      slug: 'baby-potty',
      nameEn: 'Baby Potty',
      nameSw: 'Potty ya Mtoto',
      descriptionEn: 'Comfortable baby potty',
      descriptionSw: 'Potty ya mtoto yenye starehe',
      priceCents: 30000,
      imageUrl: '/images/plastics/baby-potty.svg',
      categoryId: potties?.id,
    },
  ];
  
  console.log('📦 Creating products...\n');
  
  let created = 0;
  for (const productData of products) {
    if (!productData.categoryId) {
      console.log(`⚠️  Skipped: ${productData.nameEn} (category not found)`);
      continue;
    }
    
    try {
      const product = await prisma.product.create({
        data: {
          ...productData,
          vendorId: vendor.id,
          inStock: true,
        },
      });
      console.log(`✅ Created: ${product.nameEn} - KES ${product.priceCents / 100}`);
      created++;
    } catch (error: any) {
      console.log(`⚠️  Skipped: ${productData.nameEn} (${error.message})`);
    }
  }
  
  console.log(`\n🎉 Successfully created ${created}/${products.length} products!\n`);
  console.log('Visit: http://localhost:3000/shop/kutus-general-store');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
