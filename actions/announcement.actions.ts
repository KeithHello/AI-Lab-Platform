'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  deleteAnnouncementSchema,
} from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getAnnouncements() {
  await requireAdmin();
  return prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createAnnouncement(input: unknown) {
  await requireAdmin();
  const validated = createAnnouncementSchema.parse(input);

  const announcement = await prisma.announcement.create({
    data: {
      title: validated.title,
      content: validated.content,
    },
  });

  revalidatePath('/admin/announcements');
  revalidatePath('/');
  return { success: true, data: announcement };
}

export async function updateAnnouncement(input: unknown) {
  await requireAdmin();
  const validated = updateAnnouncementSchema.parse(input);

  const updated = await prisma.announcement.update({
    where: { id: validated.announcementId },
    data: {
      ...(validated.title && { title: validated.title }),
      ...(validated.content && { content: validated.content }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    },
  });

  revalidatePath('/admin/announcements');
  return { success: true, data: updated };
}

export async function deleteAnnouncement(input: unknown) {
  await requireAdmin();
  const validated = deleteAnnouncementSchema.parse(input);

  await prisma.announcement.delete({
    where: { id: validated.announcementId },
  });

  revalidatePath('/admin/announcements');
  return { success: true };
}
