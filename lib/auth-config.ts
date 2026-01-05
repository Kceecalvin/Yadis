import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone Number', type: 'tel', placeholder: '+254 700 000 000' },
        code: { label: 'Verification Code', type: 'text', placeholder: '123456' },
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          return null;
        }

        try {
          // TODO: Implement phone verification logic
          // For now, we'll create/find user by phone
          const user = await prisma.user.upsert({
            where: { phone: credentials.phone },
            update: {},
            create: {
              phone: credentials.phone,
              phoneVerified: true,
              name: `User ${credentials.phone}`,
            },
          });

          return user;
        } catch (error) {
          console.error('Phone auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google sign-in, check if user exists
      if (account?.provider === 'google' && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          // If user doesn't exist, redirect to signup
          if (!existingUser) {
            // Store email in a way that can be retrieved on signup page
            // We'll handle this by redirecting through a special route
            return '/auth/signup?email=' + encodeURIComponent(user.email) + '&name=' + encodeURIComponent(user.name || '');
          } else if (existingUser.isPlatformAdmin) {
            // Preserve admin status
            user.id = existingUser.id;
            return true;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.isPlatformAdmin = user.isPlatformAdmin || false;
      }
      
      // For Google sign-in, fetch full user data from database
      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          
          console.log('JWT callback - Fetched user from DB:', {
            email: dbUser?.email,
            isPlatformAdmin: dbUser?.isPlatformAdmin
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.isPlatformAdmin = dbUser.isPlatformAdmin === true;
            console.log('JWT callback - Token updated with:', { isPlatformAdmin: token.isPlatformAdmin });
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.isPlatformAdmin = (token.isPlatformAdmin as boolean) || false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home page after sign in
      // If url starts with base URL, use it; otherwise redirect to home
      if (url.startsWith(baseUrl)) return url;
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Default to home page
      return `${baseUrl}/`;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see errors
};
