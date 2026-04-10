import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import type { ActivityModule } from '@/types';

/**
 * Log an activity. Call this from API routes after CRUD operations.
 */
export async function logActivity({
  action,
  module,
  details = '',
  userId,
  refId,
  color = 'var(--accent)',
}: {
  action: string;
  module: ActivityModule;
  details?: string;
  userId: string;
  refId?: string;
  color?: string;
}) {
  try {
    await dbConnect();
    await ActivityLog.create({ action, module, details, user: userId, refId, color });
  } catch (error) {
    // Don't throw — activity logging should never break the main operation
    console.error('Activity log error:', error);
  }
}
