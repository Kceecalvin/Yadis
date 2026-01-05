import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-config';
import { prisma } from './db';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return null;
  }

  // Fetch full user data from database to include isPlatformAdmin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  }).catch(() => null);

  return user;
}
