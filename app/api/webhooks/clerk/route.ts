import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { WebhookEvent } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Webhook 驗證失敗' }, { status: 400 });
  }

  const eventType = evt.type;

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address;
      const displayName = [first_name, last_name].filter(Boolean).join(' ') || '未命名使用者';

      if (!primaryEmail || !id) {
        return NextResponse.json({ error: '缺少使用者資料' }, { status: 400 });
      }

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: primaryEmail,
          name: displayName,
          avatarUrl: image_url ?? null,
        },
        create: {
          clerkId: id,
          email: primaryEmail,
          name: displayName,
          avatarUrl: image_url ?? null,
        },
      });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      if (id) {
        await prisma.user.updateMany({
          where: { clerkId: id },
          data: { status: 'DISABLED' },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clerk webhook 處理錯誤:', error);
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 });
  }
}
