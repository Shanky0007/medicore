import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ImagingStudy from '@/models/ImagingStudy';
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
    const study = await ImagingStudy.findById(id)
      .populate('patient', 'firstName lastName patientId gender dateOfBirth phone')
      .populate('doctor', 'firstName lastName department')
      .lean();

    if (!study) return NextResponse.json({ success: false, message: 'Study not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: study });
  } catch (error) {
    console.error('Imaging GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch study' }, { status: 500 });
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
    const study = await ImagingStudy.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

    if (!study) return NextResponse.json({ success: false, message: 'Study not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: study });
  } catch (error) {
    console.error('Imaging PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update study' }, { status: 500 });
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
    await ImagingStudy.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Study deleted' });
  } catch (error) {
    console.error('Imaging DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete study' }, { status: 500 });
  }
}
