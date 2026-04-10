import mongoose, { Schema, Document } from 'mongoose';
import type { IAlert } from '@/types';

export interface AlertDocument extends Omit<IAlert, '_id'>, Document {}

const AlertSchema = new Schema<AlertDocument>(
  {
    type: { type: String, enum: ['error', 'warning', 'info'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    module: { type: String, enum: ['pharmacy', 'lab', 'imaging', 'system', 'billing'], required: true },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Alert || mongoose.model<AlertDocument>('Alert', AlertSchema);
