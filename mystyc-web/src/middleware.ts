import { NextRequest, NextResponse } from 'next/server';
// import { Ratelimit } from '@upstash/ratelimit';
// import { Redis } from '@upstash/redis';

// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(20, '60s'),
// });

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (process.env.NODE_ENV === 'production') {
    if (host !== 'mystyc.app' && host !== '127.0.0.1:3000') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } else {
    if (host !== 'localhost:3000') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Only apply rate-limit/origin checks on /api/server routes
  // if (request.nextUrl.pathname.startsWith('/api/server')) {
    // Rate limiting
    // const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    // const { success } = await ratelimit.limit(ip);
    // if (!success) {
    //   return new NextResponse('Rate limited', { status: 429 });
    // }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


