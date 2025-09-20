import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/util/logger'

// In-memory rate limiting
const requests = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = requests.get(ip);
  
  if (!record || now > record.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

async function getMiddlewareCookieName(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return 'sessionId';
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(process.env.SESSION_COOKIE_SEED!);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return '_mst_' + hashHex.substring(0, 8);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Host validation - production only
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host') || '';
    if (host !== 'mystyc.app') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const allowed = checkRateLimit(ip, 10, 60000); // 10 requests per minute
    if (!allowed) {
      return new NextResponse('Rate limited', { status: 429 });
    }
    return NextResponse.next();
  }
  
  // Auth logic only for non-API routes
  const cookieName = await getMiddlewareCookieName();
  const sessionCookie = request.cookies.get(cookieName);
  
  // Always redirect /home to /
  if (pathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Auth pages - redirect to /home if already authenticated
  if (['/login', '/register', '/password-reset'].includes(pathname)) {
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }
  
  // Logout page - redirect to / if not authenticated
  if (pathname === '/logout' || pathname === '/server-logout') {
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Rewrite / to /home when authenticated
  if (sessionCookie?.value && pathname === '/') {
    logger.info('rewrite home');
    return NextResponse.rewrite(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)', // All routes
  ],  
};