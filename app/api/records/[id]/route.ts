import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
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
    const record = await MedicalRecord.findById(id)
      .populate('patient', 'firstName lastName patientId gender dateOfBirth phone')
      .populate('doctor', 'firstName lastName department')
      .lean();

    if (!record) return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Record GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch record' }, { status: 500 });
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
    const record = await MedicalRecord.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

    if (!record) return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Record PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update record' }, { status: 500 });
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
    await MedicalRecord.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    console.error('Record DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete record' }, { status: 500 });
  }
}
