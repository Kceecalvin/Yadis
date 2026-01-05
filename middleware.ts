/**
 * Multi-Tenant Middleware with NextAuth Support
 * 
 * This middleware detects which shop the request is for based on:
 * - Subdomain: shop-name.yourdomain.com
 * - Path: yourdomain.com/shop/shop-name
 * 
 * It sets the shop slug in request headers for downstream use.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get NextAuth token if exists
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Add token info to headers for API routes
  if (token) {
    request.headers.set('x-user-email', token.email || '');
    request.headers.set('x-user-id', token.id as string || '');
    request.headers.set('x-is-admin', String(token.isPlatformAdmin || false));
  }
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Development vs Production domain handling
  const currentHost = process.env.NODE_ENV === 'production'
    ? hostname
    : hostname.replace('localhost:3000', 'localhost:3000');
  
  // Extract subdomain
  const parts = currentHost.split('.');
  
  // For subdomain-based routing
  // Example: electronics-hub.yourdomain.com
  let shopSlug: string | null = null;
  
  if (parts.length >= 3) {
    // Has subdomain
    const subdomain = parts[0];
    
    // Ignore common subdomains
    if (!['www', 'admin', 'api', 'localhost:3000'].includes(subdomain)) {
      shopSlug = subdomain;
    }
  }
  
  // For path-based routing (alternative or fallback)
  // Example: yourdomain.com/shop/electronics-hub
  const pathMatch = url.pathname.match(/^\/shop\/([^\/]+)/);
  if (pathMatch) {
    shopSlug = pathMatch[1];
  }
  
  // Platform routes (main site, not shop-specific)
  const isPlatformRoute = 
    url.pathname === '/' ||
    url.pathname.startsWith('/about') ||
    url.pathname.startsWith('/pricing') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/platform-admin');
  
  // API routes
  const isApiRoute = url.pathname.startsWith('/api');
  
  // Static files and Next.js internals
  const isStaticRoute = 
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/images');
  
  // Skip middleware for static files
  if (isStaticRoute) {
    return NextResponse.next();
  }
  
  // Create request headers
  const requestHeaders = new Headers(request.headers);
  
  // Set shop slug if found
  if (shopSlug) {
    requestHeaders.set('x-shop-slug', shopSlug);
  }
  
  // Set original hostname
  requestHeaders.set('x-original-host', hostname);
  
  // For platform routes without shop slug, proceed normally
  if (!shopSlug && isPlatformRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // For shop routes, validate shop exists (optional, adds latency)
  // Uncomment to enable shop validation in middleware
  /*
  if (shopSlug && !isPlatformRoute && !isApiRoute) {
    try {
      // Note: This adds a database call to every request
      // Consider caching shop slugs in Redis
      const shopExists = await validateShopExists(shopSlug);
      
      if (!shopExists) {
        // Shop not found, redirect to 404 or main site
        return NextResponse.rewrite(new URL('/404', request.url));
      }
    } catch (error) {
      console.error('Error validating shop:', error);
    }
  }
  */
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Optional: Validate shop exists
// Requires database connection in middleware (Edge runtime compatible)
/*
async function validateShopExists(slug: string): Promise<boolean> {
  // Implement shop validation
  // Could use Prisma with edge-compatible driver
  // Or cache shop slugs in Redis/Vercel KV
  return true;
}
*/

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
