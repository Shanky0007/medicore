import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Alert from '@/models/Alert';
import { getSession } from '@/lib/session';
import { checkPharmacyAlerts, checkLabAlerts } from '@/lib/alerts';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const resolved = searchParams.get('resolved');

    const filter: Record<string, unknown> = {};
    if (resolved === 'false') filter.isResolved = false;
    if (resolved === 'true') filter.isResolved = true;

    // Run alert checks before returning
    await Promise.all([checkPharmacyAlerts(), checkLabAlerts()]);

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Alerts GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (body.resolveId) {
      await Alert.findByIdAndUpdate(body.resolveId, { isResolved: true, resolvedAt: new Date() });
      return NextResponse.json({ success: true, message: 'Alert resolved' });
    }

    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Alerts PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update alert' }, { status: 500 });
  }
}
