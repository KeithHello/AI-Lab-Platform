'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function getNotifications(page = 1, pageSize = 20) {
  const user = await getCurrentUser();

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId: user.id } }),
  ]);

  return { notifications, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getUnreadCount() {
  const user = await getCurrentUser();
  return prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });
}

export async function markAsRead(notificationId: string) {
  const user = await getCurrentUser();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });

  revalidatePath('/dashboard');
  return { success: true };
}

export async function markAllAsRead() {
  const user = await getCurrentUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getRecentNotifications(limit = 5) {
  const user = await getCurrentUser();

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
  ]);

  return { notifications, unreadCount };
}
