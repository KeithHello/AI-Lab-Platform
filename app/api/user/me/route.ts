import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/permissions';

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
