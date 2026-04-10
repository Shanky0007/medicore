import mongoose, { Schema, Document } from 'mongoose';
import type { IActivityLog } from '@/types';

export interface ActivityLogDocument extends Omit<IActivityLog, '_id'>, Document {}

const ActivityLogSchema = new Schema<ActivityLogDocument>(
  {
    action: { type: String, required: true },
    module: {
      type: String,
      enum: ['patient', 'appointment', 'lab', 'imaging', 'pharmacy', 'billing', 'record'],
      required: true,
    },
    details: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refId: { type: Schema.Types.ObjectId },
    color: { type: String, default: 'var(--accent)' },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model<ActivityLogDocument>('ActivityLog', ActivityLogSchema);
