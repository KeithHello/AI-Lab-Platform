'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin } from '@/lib/permissions';
import { submitReportSchema, handleReportSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getReports() {
  await requireAdmin();
  return prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
    },
  });
}

export async function submitReport(input: unknown) {
  const user = await getCurrentUser();
  const validated = submitReportSchema.parse(input);

  if (validated.reportedUserId === user.id) {
    throw new Error('無法舉報自己');
  }

  const reportedUser = await prisma.user.findUnique({
    where: { id: validated.reportedUserId },
  });
  if (!reportedUser) throw new Error('被舉報的使用者不存在');

  const report = await prisma.report.create({
    data: {
      reporterId: user.id,
      reportedUserId: validated.reportedUserId,
      projectId: validated.projectId || null,
      type: validated.type,
      description: validated.description,
    },
  });

  revalidatePath('/admin/reports');
  if (validated.projectId) {
    revalidatePath(`/projects/${validated.projectId}`);
  }

  return { success: true, data: report };
}

export async function handleReport(input: unknown) {
  await requireAdmin();
  const validated = handleReportSchema.parse(input);

  const report = await prisma.report.findUnique({
    where: { id: validated.reportId },
  });
  if (!report) throw new Error('舉報不存在');

  const updated = await prisma.report.update({
    where: { id: validated.reportId },
    data: {
      status: validated.status,
      resolution: validated.resolution || null,
    },
  });

  if (validated.disableUser && report.reportedUserId) {
    await prisma.user.update({
      where: { id: report.reportedUserId },
      data: { status: 'DISABLED' },
    });
  }

  revalidatePath('/admin/reports');
  return { success: true, data: updated };
}
