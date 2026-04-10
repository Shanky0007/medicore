import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types';

const roleAccess: Record<string, UserRole[]> = {
  '/settings': ['admin'],
  '/lab': ['admin', 'doctor', 'lab-tech'],
  '/imaging': ['admin', 'doctor'],
  '/pharmacy': ['admin', 'pharmacist'],
  '/billing': ['admin', 'billing'],
  '/reports': ['admin', 'billing', 'doctor'],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const basePath = '/' + pathname.split('/')[1];
    const allowedRoles = roleAccess[basePath];

    if (allowedRoles && token?.role) {
      if (!allowedRoles.includes(token.role as UserRole)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/appointments/:path*',
    '/records/:path*',
    '/lab/:path*',
    '/imaging/:path*',
    '/pharmacy/:path*',
    '/billing/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/api/dashboard/:path*',
    '/api/patients/:path*',
    '/api/appointments/:path*',
    '/api/records/:path*',
    '/api/lab/:path*',
    '/api/imaging/:path*',
    '/api/pharmacy/:path*',
    '/api/billing/:path*',
    '/api/reports/:path*',
    '/api/settings/:path*',
    '/api/sidebar/:path*',
    '/api/alerts/:path*',
  ],
};
