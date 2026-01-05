import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Multi-Vendor Migration Started\n');
  
  // Step 1: Backup existing products
  console.log('📦 Step 1: Backing up existing products...');
  const existingProducts = await prisma.$queryRaw`
    SELECT * FROM "Product"
  `;
  console.log(`✅ Found ${(existingProducts as any[]).length} products to migrate\n`);
  
  // Save backup to file
  const fs = require('fs');
  fs.writeFileSync('/tmp/products_backup.json', JSON.stringify(existingProducts, null, 2));
  console.log('✅ Backup saved to /tmp/products_backup.json\n');
  
  console.log('📋 Products to migrate:');
  (existingProducts as any[]).forEach((p: any) => {
    console.log(`   - ${p.nameEn} (${p.slug})`);
  });
  
  console.log('\n✨ Backup complete!');
  console.log('\nNext steps:');
  console.log('1. Run: pnpm exec prisma db push --force-reset --accept-data-loss');
  console.log('2. Run: pnpm exec tsx prisma/create-vendor-and-restore.ts');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
