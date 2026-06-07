import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tags = await prisma.skillTag.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Failed to fetch skill tags:', error);
    return NextResponse.json({ error: 'Failed to fetch skill tags' }, { status: 500 });
  }
}
