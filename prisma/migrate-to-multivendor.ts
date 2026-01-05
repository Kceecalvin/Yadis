import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration to multi-vendor system...\n');

  // Step 1: Create your vendor account
  console.log('1️⃣ Creating your store as first vendor...');
  
  const vendor = await prisma.vendor.create({
    data: {
      slug: 'kutus-general-store',
      name: 'Kutus General Store',
      description: 'Quality Food & Household Items - Your trusted local store',
      businessType: 'RETAIL',
      location: 'Kutus Town Center',
      ownerName: 'Store Owner',
      ownerPhone: '+254700000000', // Update this with your actual phone
      ownerEmail: 'owner@kutusstore.com', // Update with your email
      ownerId: 'temp-owner-id', // We'll update this after auth is working
      status: 'APPROVED', // Auto-approved since it's your store
      commissionRate: 0, // 0% commission for your own store!
      primaryColor: '#8B4513',
      secondaryColor: '#A0522D',
      accentColor: '#D2691E',
    },
  });

  console.log(`✅ Vendor created: ${vendor.name} (${vendor.slug})`);
  console.log(`   Commission: ${vendor.commissionRate}% (FREE for your store!)\n`);

  console.log('✨ Migration complete! Your store is now Vendor #1!\n');
  console.log('Next: Run `prisma db push --force-reset` to apply schema changes');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
