import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to app API routes
  if (request.nextUrl.pathname.startsWith('/api/server')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const pathname = request.nextUrl.pathname;

    // Allow same-origin requests and app specific domains
    const allowedOrigins = [
      `https://${host}`,
      `http://${host}`,
      'https://mystyc.app',
      'https://mystyc-client.loca.lt'
    ];
    
    // Protect both API routes and user/admin pages from cross-origin
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