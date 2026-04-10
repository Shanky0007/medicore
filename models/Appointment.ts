import mongoose, { Schema, Document } from 'mongoose';
import type { IAppointment } from '@/types';

export interface AppointmentDocument extends Omit<IAppointment, '_id'>, Document {}

const AppointmentSchema = new Schema<AppointmentDocument>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    dateTime: { type: Date, required: true },
    duration: { type: Number, default: 30 },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-preparation', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model<AppointmentDocument>('Appointment', AppointmentSchema);
