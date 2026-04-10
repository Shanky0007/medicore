import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LabRequest from '@/models/LabRequest';
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
    const labRequest = await LabRequest.findById(id)
      .populate('patient', 'firstName lastName patientId gender dateOfBirth phone')
      .populate('doctor', 'firstName lastName department')
      .populate('validatedBy', 'firstName lastName')
      .lean();

    if (!labRequest) return NextResponse.json({ success: false, message: 'Lab request not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: labRequest });
  } catch (error) {
    console.error('Lab GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch lab request' }, { status: 500 });
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

    // If validating, set validatedBy and validatedAt
    if (body.status === 'validated') {
      body.validatedBy = session.user.id;
      body.validatedAt = new Date();
    }

    const labRequest = await LabRequest.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .lean();

    if (!labRequest) return NextResponse.json({ success: false, message: 'Lab request not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: labRequest });
  } catch (error) {
    console.error('Lab PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update lab request' }, { status: 500 });
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
    await LabRequest.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Lab request deleted' });
  } catch (error) {
    console.error('Lab DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete lab request' }, { status: 500 });
  }
}
