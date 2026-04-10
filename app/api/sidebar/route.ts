import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';
import Appointment from '@/models/Appointment';
import LabRequest from '@/models/LabRequest';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [patients, appointmentsToday, labPending] = await Promise.all([
      Patient.countDocuments({ status: 'active' }),
      Appointment.countDocuments({ dateTime: { $gte: todayStart, $lt: todayEnd }, status: { $ne: 'cancelled' } }),
      LabRequest.countDocuments({ status: { $in: ['requested', 'sample-collected', 'in-progress'] } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { patients, appointmentsToday, labPending },
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
