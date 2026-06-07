'use server';

import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDevUsers() {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  try {
    return await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        onboardingCompleted: true,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        canPostProjects: true,
        canApplyProjects: true,
        isAdmin: true,
      },
      orderBy: [
        { isAdmin: 'desc' },
        { canPostProjects: 'desc' },
        { canApplyProjects: 'desc' },
        { name: 'asc' },
      ],
    });
  } catch (error) {
    console.error('Failed to fetch dev users:', error);
    return [];
  }
}

export async function switchDevUser(targetUserId: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Only allowed in development mode');
  }

  const { userId: currentClerkId } = auth();
  if (!currentClerkId) {
    throw new Error('請先登入 Clerk 帳號才能切換測試帳號');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!targetUser) {
    throw new Error(`找不到 mock 使用者：${targetUserId}`);
  }

  cookies().set('dev_user_id', targetUser.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  revalidatePath('/');
  return { success: true };
}

export async function clearDevUser() {
  if (process.env.NODE_ENV !== 'development') {
    return { success: true };
  }

  cookies().delete('dev_user_id');
  revalidatePath('/');
  return { success: true };
}
