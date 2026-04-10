import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getSession } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const invoice = await Invoice.findById(id).populate('patient', 'firstName lastName patientId gender phone').lean();
    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Billing GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // If adding a payment
    if (body.addPayment) {
      const invoice = await Invoice.findById(id);
      if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

      invoice.payments.push({ ...body.addPayment, paidAt: new Date() });
      invoice.paidAmount = invoice.payments.reduce((s: number, p: { amount: number }) => s + p.amount, 0);
      invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : invoice.paidAmount > 0 ? 'partially-paid' : 'unpaid';
      await invoice.save();

      await logActivity({ action: `Invoice ${invoice.invoiceId}`, module: 'billing', details: `payment — ${body.addPayment.amount} MAD`, userId: session.user.id, refId: id, color: 'var(--green)' });

      return NextResponse.json({ success: true, data: invoice });
    }

    const invoice = await Invoice.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Billing PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await Invoice.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    console.error('Billing DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete invoice' }, { status: 500 });
  }
}
