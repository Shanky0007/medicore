import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ImagingStudy from '@/models/ImagingStudy';
import { getSession } from '@/lib/session';

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
    const type = searchParams.get('type') || '';

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { studyId: { $regex: search, $options: 'i' } },
        { bodyPart: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      ImagingStudy.find(filter)
        .populate('patient', 'firstName lastName patientId')
        .populate('doctor', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ImagingStudy.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data, pagination: { page, limit, total } });
  } catch (error) {
    console.error('Imaging GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch imaging studies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const last = await ImagingStudy.findOne().sort({ createdAt: -1 }).select('studyId').lean() as { studyId?: string } | null;
    let seq = 1;
    if (last?.studyId) {
      const parts = last.studyId.split('-');
      seq = parseInt(parts[parts.length - 1]) + 1;
    }
    const studyId = `IMG-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;

    const study = await ImagingStudy.create({ ...body, studyId, doctor: body.doctor || session.user.id });
    return NextResponse.json({ success: true, data: study }, { status: 201 });
  } catch (error) {
    console.error('Imaging POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create imaging study' }, { status: 500 });
  }
}
