import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏪 Creating Your Store & Restoring Products\n');
  
  // Step 1: Create your vendor
  console.log('1️⃣ Creating "Kutus General Store" as Vendor #1...');
  
  // Get the first user (you) as owner, or create temp
  let ownerId = 'temp-owner-id';
  const users = await prisma.user.findMany({ take: 1 });
  if (users.length > 0) {
    ownerId = users[0].id;
    console.log(`   Using user: ${users[0].email || users[0].name || 'User'}`);
  }
  
  const vendor = await prisma.vendor.create({
    data: {
      slug: 'kutus-general-store',
      name: 'Kutus General Store',
      description: 'Quality Food & Household Items - Your trusted local store',
      businessType: 'RETAIL',
      location: 'Kutus Town Center',
      ownerName: 'Store Owner',
      ownerPhone: '+254700000000',
      ownerEmail: 'owner@kutusstore.com',
      ownerId: ownerId,
      status: 'APPROVED',
      commissionRate: 0, // FREE for your store!
      allowsDelivery: true,
    },
  });
  
  console.log(`✅ Vendor created: ${vendor.name}`);
  console.log(`   Slug: ${vendor.slug}`);
  console.log(`   Commission: ${vendor.commissionRate}% (FREE!)`);
  console.log(`   Status: ${vendor.status}\n`);
  
  // Step 2: Restore products
  console.log('2️⃣ Restoring your products...');
  
  const backupFile = '/tmp/products_backup.json';
  if (!fs.existsSync(backupFile)) {
    console.log('❌ No backup file found!');
    return;
  }
  
  const products = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
  console.log(`   Found ${products.length} products in backup\n`);
  
  let restored = 0;
  for (const p of products) {
    try {
      await prisma.product.create({
        data: {
          slug: p.slug,
          nameEn: p.nameEn,
          nameSw: p.nameSw,
          descriptionEn: p.descriptionEn,
          descriptionSw: p.descriptionSw,
          priceCents: p.priceCents,
          imageUrl: p.imageUrl,
          categoryId: p.categoryId,
          vendorId: vendor.id, // Link to your vendor!
          inStock: p.inStock,
        },
      });
      console.log(`   ✅ Restored: ${p.nameEn}`);
      restored++;
    } catch (error) {
      console.log(`   ⚠️  Skipped: ${p.nameEn} (${error.message})`);
    }
  }
  
  console.log(`\n✅ Restored ${restored}/${products.length} products\n`);
  
  // Step 3: Summary
  console.log('📊 Migration Summary:');
  console.log('   ✅ Vendor created: Kutus General Store');
  console.log(`   ✅ Products restored: ${restored}`);
  console.log('   ✅ All products linked to your vendor');
  console.log('\n🎉 Migration Complete!\n');
  console.log('Your store is now ready as Vendor #1!');
  console.log('Start the server: pnpm dev');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
