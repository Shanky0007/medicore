import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getSession } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) filter.$or = [{ invoiceId: { $regex: search, $options: 'i' } }];
    if (dateFrom || dateTo) {
      const df: Record<string, Date> = {};
      if (dateFrom) df.$gte = new Date(dateFrom);
      if (dateTo) { const e = new Date(dateTo); e.setDate(e.getDate() + 1); df.$lt = e; }
      if (Object.keys(df).length) filter.createdAt = df;
    }

    const [data, total] = await Promise.all([
      Invoice.find(filter).populate('patient', 'firstName lastName patientId').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Invoice.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data, pagination: { page, limit, total } });
  } catch (error) {
    console.error('Billing GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const last = await Invoice.findOne().sort({ createdAt: -1 }).select('invoiceId').lean() as { invoiceId?: string } | null;
    let seq = 1;
    if (last?.invoiceId) { const p = last.invoiceId.split('-'); seq = parseInt(p[p.length - 1]) + 1; }
    const invoiceId = `F-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;

    const totalAmount = (body.items || []).reduce((s: number, i: { amount: number }) => s + (i.amount || 0), 0);

    const invoice = await Invoice.create({ ...body, invoiceId, totalAmount, paidAmount: 0, status: 'unpaid', payments: [], createdBy: session.user.id });

    await logActivity({ action: `Invoice ${invoiceId}`, module: 'billing', details: `created — ${totalAmount} MAD`, userId: session.user.id, refId: invoice._id.toString(), color: 'var(--accent2)' });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Billing POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create invoice' }, { status: 500 });
  }
}
