import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { UserRole } from '@/types';

/**
 * Get the current session in a server component or API route.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Check if the current user has one of the allowed roles.
 * Returns the session if authorized, null otherwise.
 */
export async function requireRole(...roles: UserRole[]) {
  const session = await getSession();
  if (!session?.user?.role) return null;
  if (!roles.includes(session.user.role)) return null;
  return session;
}
