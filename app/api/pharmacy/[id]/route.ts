import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PharmacyItem from '@/models/PharmacyItem';
import { getSession } from '@/lib/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const item = await PharmacyItem.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Pharmacy GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch item' }, { status: 500 });
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

    // Auto-compute status
    if (body.quantity !== undefined) {
      const item = await PharmacyItem.findById(id).lean() as { minThreshold?: number } | null;
      const threshold = body.minThreshold ?? item?.minThreshold ?? 10;
      if (body.quantity <= 0) body.status = 'out-of-stock';
      else if (body.quantity <= threshold) body.status = 'low-stock';
      else body.status = 'in-stock';
    }

    const updated = await PharmacyItem.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!updated) return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Pharmacy PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update item' }, { status: 500 });
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
    await PharmacyItem.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Pharmacy DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete item' }, { status: 500 });
  }
}
