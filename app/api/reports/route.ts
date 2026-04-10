import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import Invoice from '@/models/Invoice';
import LabRequest from '@/models/LabRequest';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const dateFilter: Record<string, unknown> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) { const e = new Date(dateTo); e.setDate(e.getDate() + 1); dateFilter.$lt = e; }
    const hasDate = Object.keys(dateFilter).length > 0;

    const aptMatch = hasDate ? { dateTime: dateFilter, status: { $ne: 'cancelled' } } : { status: { $ne: 'cancelled' } };
    const invMatch = hasDate ? { createdAt: dateFilter } : {};

    const [consultationsByDept, patientDistribution, revenueByMonth, appointmentStats, labStats] = await Promise.all([
      Appointment.aggregate([{ $match: aptMatch }, { $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Patient.aggregate([{ $match: { status: 'active' } }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      Invoice.aggregate([
        { $match: invMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$paidAmount' }, invoices: { $sum: 1 } } },
        { $sort: { _id: 1 } }, { $limit: 12 },
      ]),
      Appointment.aggregate([
        { $match: aptMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      LabRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueByMonth.reduce((s: number, r: { revenue: number }) => s + r.revenue, 0);
    const totalPatients = patientDistribution.reduce((s: number, p: { count: number }) => s + p.count, 0);
    const totalAppointments = appointmentStats.reduce((s: number, a: { count: number }) => s + a.count, 0);

    return NextResponse.json({
      success: true,
      data: { consultationsByDept, patientDistribution, revenueByMonth, appointmentStats, labStats, totalRevenue, totalPatients, totalAppointments },
    });
  } catch (error) {
    console.error('Reports GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate reports' }, { status: 500 });
  }
}
