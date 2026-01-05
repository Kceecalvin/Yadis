import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Top-level categories (optional labels)
  await prisma.category.upsert({
    where: { slug: 'food' },
    update: {},
    create: { slug: 'food', titleEn: 'Food', titleSw: 'Chakula', section: 'FOOD' },
  });
  await prisma.category.upsert({
    where: { slug: 'plastics' },
    update: {},
    create: { slug: 'plastics', titleEn: 'Household Plastics', titleSw: 'Plastiki za Nyumbani', section: 'PLASTICS' },
  });

  // Subcategories under Food
  const iceCream = await prisma.category.upsert({
    where: { slug: 'ice-cream' },
    update: {},
    create: { slug: 'ice-cream', titleEn: 'Ice Cream', titleSw: 'Aiskrimu', section: 'FOOD' },
  });
  const cakesPastriesPizza = await prisma.category.upsert({
    where: { slug: 'cakes-pastries-pizza' },
    update: {},
    create: { slug: 'cakes-pastries-pizza', titleEn: 'Cakes, Pastries & Pizza', titleSw: 'Keki, Vitafunwa & Piza', section: 'FOOD' },
  });
  const yogurtJuices = await prisma.category.upsert({
    where: { slug: 'yogurt-juices' },
    update: {},
    create: { slug: 'yogurt-juices', titleEn: 'Yogurt & Juices', titleSw: 'Mtindi & Juisi', section: 'FOOD' },
  });
  const snacks = await prisma.category.upsert({
    where: { slug: 'snacks' },
    update: {},
    create: { slug: 'snacks', titleEn: 'Snacks', titleSw: 'Vitafunio', section: 'FOOD' },
  });
  const hotMeals = await prisma.category.upsert({
    where: { slug: 'hot-meals' },
    update: {},
    create: { slug: 'hot-meals', titleEn: 'Hot Meals', titleSw: 'Chakula Moto', section: 'FOOD' },
  });

  // Subcategories under Plastics
  const buckets = await prisma.category.upsert({
    where: { slug: 'buckets' },
    update: {},
    create: { slug: 'buckets', titleEn: 'Buckets', titleSw: 'Ndoo', section: 'PLASTICS' },
  });
  const brooms = await prisma.category.upsert({
    where: { slug: 'brooms' },
    update: {},
    create: { slug: 'brooms', titleEn: 'Brooms', titleSw: 'Fagio', section: 'PLASTICS' },
  });
  const chairs = await prisma.category.upsert({
    where: { slug: 'chairs' },
    update: {},
    create: { slug: 'chairs', titleEn: 'Chairs', titleSw: 'Viti', section: 'PLASTICS' },
  });
  const spoons = await prisma.category.upsert({
    where: { slug: 'spoons' },
    update: {},
    create: { slug: 'spoons', titleEn: 'Spoons', titleSw: 'Vijiko', section: 'PLASTICS' },
  });
  const potties = await prisma.category.upsert({
    where: { slug: 'potties' },
    update: {},
    create: { slug: 'potties', titleEn: 'Potties', titleSw: 'Vyombo vya Watoto', section: 'PLASTICS' },
  });

  // Products
  await prisma.product.upsert({
    where: { slug: 'chips-masala' },
    update: {},
    create: {
      slug: 'chips-masala',
      nameEn: 'Chips Masala',
      nameSw: 'Chips Masala',
      descriptionEn: 'Spicy chips masala',
      descriptionSw: 'Chips masala ya viungo',
      priceCents: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1556761175-129418cb2dfe?auto=format&fit=crop&w=1200&q=80',
      categoryId: hotMeals.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'pilau' },
    update: {},
    create: {
      slug: 'pilau',
      nameEn: 'Pilau',
      nameSw: 'Pilau',
      descriptionEn: 'Classic Swahili pilau',
      descriptionSw: 'Pilau la Kiswahili',
      priceCents: 40000,
      imageUrl: 'https://images.unsplash.com/photo-1617195737499-8a04a835a0c2?auto=format&fit=crop&w=1200&q=80',
      categoryId: hotMeals.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'biriyani' },
    update: {},
    create: {
      slug: 'biriyani',
      nameEn: 'Biriyani',
      nameSw: 'Biriyani',
      descriptionEn: 'Aromatic biriyani',
      descriptionSw: 'Biriyani yenye manukato',
      priceCents: 50000,
      imageUrl: 'https://images.unsplash.com/photo-1604908177072-d79c3f7d3a4a?auto=format&fit=crop&w=1200&q=80',
      categoryId: hotMeals.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'viazi-karai' },
    update: {},
    create: {
      slug: 'viazi-karai',
      nameEn: 'Viazi Karai',
      nameSw: 'Viazi Karai',
      descriptionEn: 'Crispy viazi karai',
      descriptionSw: 'Viazi karai vitamu',
      priceCents: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80',
      categoryId: hotMeals.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'chapo' },
    update: {},
    create: {
      slug: 'chapo',
      nameEn: 'Chapati',
      nameSw: 'Chapati',
      descriptionEn: 'Soft chapati',
      descriptionSw: 'Chapati laini',
      priceCents: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1546549039-49fa3b6d8a06?auto=format&fit=crop&w=1200&q=80',
      categoryId: hotMeals.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'deluxe-bucket-20l' },
    update: {},
    create: {
      slug: 'deluxe-bucket-20l',
      nameEn: 'Deluxe Bucket 20L',
      nameSw: 'Ndoo Deluxe 20L',
      descriptionEn: 'Durable plastic bucket',
      descriptionSw: 'Ndoo ya plastiki imara',
      priceCents: 120000,
      imageUrl: 'https://images.unsplash.com/photo-1617957901868-f9a9f9d7f504?auto=format&fit=crop&w=1200&q=80',
      categoryId: buckets.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'plastic-chair' },
    update: {},
    create: {
      slug: 'plastic-chair',
      nameEn: 'Plastic Chair',
      nameSw: 'Kiti cha Plastiki',
      descriptionEn: 'Comfortable plastic chair',
      descriptionSw: 'Kiti cha plastiki kinachofaa',
      priceCents: 180000,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      categoryId: chairs.id,
    },
  });

  // Extra sample products
  await prisma.product.upsert({
    where: { slug: 'vanilla-ice-cream-500ml' },
    update: {},
    create: {
      slug: 'vanilla-ice-cream-500ml',
      nameEn: 'Vanilla Ice Cream 500ml',
      nameSw: 'Aiskrimu Vanilla 500ml',
      descriptionEn: 'Creamy vanilla ice cream, 500ml tub',
      descriptionSw: 'Aiskrimu laini ya vanilla, 500ml',
      priceCents: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1505253216365-9a62004aeb47?auto=format&fit=crop&w=1200&q=80',
      categoryId: iceCream.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'margherita-pizza-medium' },
    update: {},
    create: {
      slug: 'margherita-pizza-medium',
      nameEn: 'Margherita Pizza (Medium)',
      nameSw: 'Piza Margherita (Kati)',
      descriptionEn: 'Classic pizza with mozzarella and basil',
      descriptionSw: 'Piza ya jadi na jibini la mozzarella na bizari',
      priceCents: 90000,
      imageUrl: 'https://images.unsplash.com/photo-1548365328-9f547fb0953e?auto=format&fit=crop&w=1200&q=80',
      categoryId: cakesPastriesPizza.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'chocolate-cake-500g' },
    update: {},
    create: {
      slug: 'chocolate-cake-500g',
      nameEn: 'Chocolate Cake 500g',
      nameSw: 'Keki ya Shokoleti 500g',
      descriptionEn: 'Rich and moist chocolate cake',
      descriptionSw: 'Keki ya shokoleti laini na nene',
      priceCents: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
      categoryId: cakesPastriesPizza.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'croissants-pack-4' },
    update: {},
    create: {
      slug: 'croissants-pack-4',
      nameEn: 'Croissants Pack (4pcs)',
      nameSw: 'Mkate wa Kibingereza (4)',
      descriptionEn: 'Buttery croissants, 4 pieces',
      descriptionSw: 'Mkate wa kibingereza yenye simu, 4 vipande',
      priceCents: 28000,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
      categoryId: cakesPastriesPizza.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'vanilla-cake-500g' },
    update: {},
    create: {
      slug: 'vanilla-cake-500g',
      nameEn: 'Vanilla Cake 500g',
      nameSw: 'Keki ya Vanilla 500g',
      descriptionEn: 'Classic vanilla sponge cake',
      descriptionSw: 'Keki ya vanilla ya jadi',
      priceCents: 40000,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
      categoryId: cakesPastriesPizza.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'pepperoni-pizza-large' },
    update: {},
    create: {
      slug: 'pepperoni-pizza-large',
      nameEn: 'Pepperoni Pizza (Large)',
      nameSw: 'Piza ya Pepperoni (Kubwa)',
      descriptionEn: 'Large pizza with pepperoni and cheese',
      descriptionSw: 'Piza kubwa yenye pepperoni na jibini',
      priceCents: 120000,
      imageUrl: 'https://images.unsplash.com/photo-1614049162883-4a1b78d3c014?auto=format&fit=crop&w=1200&q=80',
      categoryId: cakesPastriesPizza.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'donuts-pack-6' },
    update: {},
    create: {
      slug: 'donuts-pack-6',
      nameEn: 'Donuts Pack (6pcs)',
      nameSw: 'Donuts (6)',
      descriptionEn: 'Assorted glazed donuts, 6 pieces',
      descriptionSw: 'Donuts mbalimbali yenye simu, 6 vipande',
      priceCents: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1585095923894-126208e86f09?auto=format&fit=crop&w=1200&q=80',
      categoryId: cakesPastriesPizza.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'fresh-yogurt-1l' },
    update: {},
    create: {
      slug: 'fresh-yogurt-1l',
      nameEn: 'Fresh Yogurt 1L',
      nameSw: 'Mtindi Safi 1L',
      descriptionEn: 'Fresh and smooth yogurt, 1 liter',
      descriptionSw: 'Mtindi safi na laini, lita 1',
      priceCents: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1520981825232-ece5fae45120?auto=format&fit=crop&w=1200&q=80',
      categoryId: yogurtJuices.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'mango-juice-1l' },
    update: {},
    create: {
      slug: 'mango-juice-1l',
      nameEn: 'Mango Juice 1L',
      nameSw: 'Juisi ya Embe 1L',
      descriptionEn: 'Refreshing mango juice, 1 liter',
      descriptionSw: 'Juisi ya embe, lita 1',
      priceCents: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&w=1200&q=80',
      categoryId: yogurtJuices.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'crisps-150g' },
    update: {},
    create: {
      slug: 'crisps-150g',
      nameEn: 'Crisps 150g',
      nameSw: 'Crisps 150g',
      descriptionEn: 'Crunchy potato crisps, 150g pack',
      descriptionSw: 'Crisps za viazi, pakiti 150g',
      priceCents: 12000,
      imageUrl: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=1200&q=80',
      categoryId: snacks.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'soft-broom' },
    update: {},
    create: {
      slug: 'soft-broom',
      nameEn: 'Soft Broom',
      nameSw: 'Fagio Laini',
      descriptionEn: 'Soft bristle broom for indoor use',
      descriptionSw: 'Fagio lenye manyoya laini kwa matumizi ya ndani',
      priceCents: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
      categoryId: brooms.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'plastic-spoons-set-6' },
    update: {},
    create: {
      slug: 'plastic-spoons-set-6',
      nameEn: 'Plastic Spoons Set (6pcs)',
      nameSw: 'Seti ya Vijiko (6)',
      descriptionEn: 'Durable plastic spoons, 6 pieces',
      descriptionSw: 'Vijiko vya plastiki, 6 vipande',
      priceCents: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1520208422220-7da6ffd4734b?auto=format&fit=crop&w=1200&q=80',
      categoryId: spoons.id,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'baby-potty' },
    update: {},
    create: {
      slug: 'baby-potty',
      nameEn: 'Baby Potty',
      nameSw: 'Choo cha Mtoto',
      descriptionEn: 'Easy-clean baby potty',
      descriptionSw: 'Choo cha mtoto rahisi kusafisha',
      priceCents: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1608889175271-1d1ec2d96686?auto=format&fit=crop&w=1200&q=80',
      categoryId: potties.id,
    },
  });
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
