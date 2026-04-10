import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';
import Appointment from '@/models/Appointment';
import LabRequest from '@/models/LabRequest';
import ImagingStudy from '@/models/ImagingStudy';
import PharmacyItem from '@/models/PharmacyItem';
import Invoice from '@/models/Invoice';
import Alert from '@/models/Alert';
import ActivityLog from '@/models/ActivityLog';
import MedicalRecord from '@/models/MedicalRecord';

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── KPIs ──
    const [
      patientsToday,
      patientsYesterday,
      admissionsToday,
      labAnalyses,
      labPending,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      Appointment.countDocuments({ dateTime: { $gte: todayStart, $lt: todayEnd } }),
      Appointment.countDocuments({ dateTime: { $gte: yesterdayStart, $lt: todayStart } }),
      Patient.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
      LabRequest.countDocuments({ createdAt: { $gte: monthStart } }),
      LabRequest.countDocuments({ status: { $in: ['requested', 'sample-collected', 'in-progress'] } }),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
    ]);

    const revThisMonth = revenueThisMonth[0]?.total || 0;
    const revLastMonth = revenueLastMonth[0]?.total || 0;
    const revDelta = revLastMonth > 0 ? Math.round(((revThisMonth - revLastMonth) / revLastMonth) * 100) : 0;

    // ── Waiting room (today's appointments) ──
    const waitingRoom = await Appointment.find({
      dateTime: { $gte: todayStart, $lt: todayEnd },
    })
      .populate('patient', 'firstName lastName gender dateOfBirth')
      .populate('doctor', 'firstName lastName')
      .sort({ dateTime: 1 })
      .limit(10)
      .lean();

    // ── Upcoming appointments (confirmed, future today) ──
    const upcoming = await Appointment.find({
      dateTime: { $gte: now, $lt: todayEnd },
      status: { $in: ['scheduled', 'confirmed', 'in-preparation'] },
    })
      .populate('patient', 'firstName lastName')
      .sort({ dateTime: 1 })
      .limit(5)
      .lean();

    // ── Alerts (unresolved) ──
    const alerts = await Alert.find({ isResolved: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ── Module counts ──
    const [
      totalPatients,
      totalRecords,
      totalLabAnalyses,
      totalImagingExams,
      totalPharmacyProducts,
      totalInvoices,
    ] = await Promise.all([
      Patient.countDocuments({ status: 'active' }),
      MedicalRecord.countDocuments(),
      LabRequest.countDocuments(),
      ImagingStudy.countDocuments(),
      PharmacyItem.countDocuments(),
      Invoice.countDocuments(),
    ]);

    // ── Consultations by department (this month) ──
    const consultationsByDept = await Appointment.aggregate([
      { $match: { dateTime: { $gte: monthStart }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // ── Patient distribution by category ──
    const patientDistribution = await Patient.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // ── Activity log (recent) ──
    const activityLog = await ActivityLog.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(9)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          patientsToday,
          patientsDelta: patientsToday - patientsYesterday,
          admissionsToday,
          labAnalyses,
          labPending,
          revenue: revThisMonth,
          revenueDelta: revDelta,
        },
        waitingRoom,
        upcoming,
        alerts,
        moduleCounts: {
          patients: totalPatients,
          records: totalRecords,
          labAnalyses: totalLabAnalyses,
          imagingExams: totalImagingExams,
          pharmacyProducts: totalPharmacyProducts,
          invoices: totalInvoices,
        },
        consultationsByDept,
        patientDistribution,
        activityLog,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
