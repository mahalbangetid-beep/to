import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedPaths = ['/dashboard', '/orders', '/my-products', '/notifications', '/account'];
const adminPaths = ['/admin'];
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path needs protection
  // Note: Real token validation should happen server-side.
  // This middleware only does a basic check for token existence.
  // The actual auth validation happens when the API is called.

  // For now, we'll let the client-side AuthProvider handle redirects
  // since JWT validation requires the secret key which is on the backend.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/my-products/:path*',
    '/notifications/:path*',
    '/account/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
