import { prisma } from '@/lib/db';

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isPlatformAdmin: true },
    });

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log(`User: ${updatedUser.name} (${updatedUser.email})`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const email = process.argv[2] || 'kcalvinmwenda@gmail.com';
makeAdmin(email);
