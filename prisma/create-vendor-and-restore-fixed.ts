import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏪 Creating Your Store & Restoring Products\n');
  
  // Step 1: Create/get owner user
  console.log('1️⃣ Creating owner account...');
  
  let owner = await prisma.user.findFirst();
  
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        name: 'Store Owner',
        email: 'owner@kutusstore.com',
        phone: '+254700000000',
        isVendor: true,
        isPlatformAdmin: true, // You're the platform admin!
      },
    });
    console.log('✅ Created owner account');
  } else {
    // Update existing user to be vendor and admin
    owner = await prisma.user.update({
      where: { id: owner.id },
      data: {
        isVendor: true,
        isPlatformAdmin: true,
      },
    });
    console.log(`✅ Using existing user: ${owner.email || owner.name || 'User'}`);
  }
  
  console.log(`   User ID: ${owner.id}\n`);
  
  // Step 2: Create your vendor
  console.log('2️⃣ Creating "Kutus General Store" as Vendor #1...');
  
  const vendor = await prisma.vendor.create({
    data: {
      slug: 'kutus-general-store',
      name: 'Kutus General Store',
      description: 'Quality Food & Household Items - Your trusted local store',
      businessType: 'RETAIL',
      location: 'Kutus Town Center',
      ownerName: owner.name || 'Store Owner',
      ownerPhone: owner.phone || '+254700000000',
      ownerEmail: owner.email || 'owner@kutusstore.com',
      ownerId: owner.id,
      status: 'APPROVED',
      commissionRate: 0, // FREE for your store!
      allowsDelivery: true,
    },
  });
  
  console.log(`✅ Vendor created: ${vendor.name}`);
  console.log(`   Slug: ${vendor.slug}`);
  console.log(`   Commission: ${vendor.commissionRate}% (FREE!)`);
  console.log(`   Status: ${vendor.status}\n`);
  
  // Step 3: Restore products
  console.log('3️⃣ Restoring your products...');
  
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
    } catch (error: any) {
      console.log(`   ⚠️  Skipped: ${p.nameEn} (${error.message})`);
    }
  }
  
  console.log(`\n✅ Restored ${restored}/${products.length} products\n`);
  
  // Step 4: Summary
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║     📊 MIGRATION COMPLETE! 🎉            ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  console.log('Your Store:');
  console.log(`  Name: ${vendor.name}`);
  console.log(`  Slug: ${vendor.slug}`);
  console.log(`  Commission: ${vendor.commissionRate}%`);
  console.log(`  Status: ${vendor.status}`);
  console.log(`\nProducts: ${restored} products restored\n`);
  console.log('✨ Your store is now Vendor #1!');
  console.log('🚀 Start server: pnpm dev\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
