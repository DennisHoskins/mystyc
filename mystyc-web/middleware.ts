import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '60s'),
});

export async function middleware(request: NextRequest) {
  // Only apply to app API routes
  if (request.nextUrl.pathname.startsWith('/api/server')) {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new Response('Rate limited', { status: 429 });
    }

    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const pathname = request.nextUrl.pathname;

    const allowedOrigins = [
      `https://${host}`,
      `http://${host}`,
      'https://mystyc.app',
      'https://mystyc-client.loca.lt'
    ];
    
    if (pathname.startsWith('/api/server') || pathname.startsWith('/(mystyc)')) {
      if (origin && !allowedOrigins.includes(origin)) {
        return new Response('Forbidden', { status: 403 });
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/server/:path*', '/(mystyc)/:path*']
};