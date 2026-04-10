import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // If password is being changed, hash it
    if (body.password) {
      body.password = await hash(body.password, 12);
    } else {
      delete body.password;
    }

    const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: { ...user, password: undefined } });
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin only' }, { status: 403 });
    }

    const { id } = await params;
    await User.findByIdAndUpdate(id, { isActive: false });
    return NextResponse.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to deactivate user' }, { status: 500 });
  }
}
