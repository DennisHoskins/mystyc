import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/util/logger'

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
  const cookieName = await getMiddlewareCookieName();
  const sessionCookie = request.cookies.get(cookieName);
  const pathname = request.nextUrl.pathname;
  
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
  if (pathname === '/logout') {
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

// export async function middleware(request: NextRequest) {
//   const cookieName = await getMiddlewareCookieName();
//   const sessionCookie = request.cookies.get(cookieName);
//   if (sessionCookie?.value) {
//     if (request.nextUrl.pathname === '/') {
//       logger.info('rewrite home');
//       return NextResponse.rewrite(new URL('/home', request.url));
//     }
//   }

//   // const host = request.headers.get('host') || '';
//   // if (process.env.NODE_ENV === 'production') {
//   //   if (host !== 'mystyc.app' && host !== '127.0.0.1:3000') {
//   //     return new NextResponse('Forbidden', { status: 403 });
//   //   }
//   // } else {
//   //   if (host !== 'localhost:3000') {
//   //     return new NextResponse('Forbidden', { status: 403 });
//   //   }
//   // }

//   // Only apply rate-limit/origin checks on /api/server routes
//   // if (request.nextUrl.pathname.startsWith('/api/server')) {
//     // Rate limiting
//     // const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
//     // const { success } = await ratelimit.limit(ip);
//     // if (!success) {
//     //   return new NextResponse('Rate limited', { status: 429 });
//     // }
//   // }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // '/((?!_next/static|_next/image|favicon.ico).*)',
//     '/'
//   ],
// };

