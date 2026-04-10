import mongoose, { Schema, Document } from 'mongoose';
import type { IDispensation } from '@/types';

export interface DispensationDocument extends Omit<IDispensation, '_id'>, Document {}

const DispensationSchema = new Schema<DispensationDocument>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescription: { type: Schema.Types.ObjectId, ref: 'MedicalRecord', required: true },
    items: [{
      pharmacyItem: { type: Schema.Types.ObjectId, ref: 'PharmacyItem' },
      quantity: Number,
    }],
    dispensedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dispensedAt: { type: Date, default: Date.now },
  }
);

export default mongoose.models.Dispensation || mongoose.model<DispensationDocument>('Dispensation', DispensationSchema);
