'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import { disableUserSchema, enableUserSchema, disableProjectSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { Prisma, ProjectStatus, UserStatus } from '@prisma/client';

export async function getAdminStats() {
  await requireAdmin();

  const [totalUsers, totalProjects, pendingReports, openDisputes] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.dispute.count({ where: { status: 'OPEN' } }),
  ]);

  return { totalUsers, totalProjects, pendingReports, openDisputes };
}

type AdminUserFilters = {
  query?: string;
  status?: 'ALL' | UserStatus;
  capability?: 'ALL' | 'CAN_POST' | 'CAN_APPLY' | 'BOTH';
};

type AdminProjectFilters = {
  query?: string;
  status?: 'ALL' | ProjectStatus;
  approval?: 'ALL' | 'APPROVED' | 'PENDING';
};

export async function getAdminUsers(
  page: number = 1,
  limit: number = 10,
  filters: AdminUserFilters = {}
) {
  await requireAdmin();
  const skip = (page - 1) * limit;
  const query = filters.query?.trim();
  const where: Prisma.UserWhereInput = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(filters.status && filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.capability === 'CAN_POST' ? { canPostProjects: true } : {}),
    ...(filters.capability === 'CAN_APPLY' ? { canApplyProjects: true } : {}),
    ...(filters.capability === 'BOTH' ? { canPostProjects: true, canApplyProjects: true } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  return {
    users,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminProjects(
  page: number = 1,
  limit: number = 10,
  filters: AdminProjectFilters = {}
) {
  await requireAdmin();
  const skip = (page - 1) * limit;
  const query = filters.query?.trim();
  const where: Prisma.ProjectWhereInput = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { client: { name: { contains: query, mode: 'insensitive' } } },
            { client: { email: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(filters.status && filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.approval === 'APPROVED' ? { isApproved: true } : {}),
    ...(filters.approval === 'PENDING' ? { isApproved: false } : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);
  return {
    projects,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function disableUser(input: unknown) {
  await requireAdmin();
  const validated = disableUserSchema.parse(input);

  const updated = await prisma.user.update({
    where: { id: validated.userId },
    data: { status: 'DISABLED' },
  });

  revalidatePath('/admin/users');
  return { success: true, data: updated };
}

export async function enableUser(input: unknown) {
  await requireAdmin();
  const validated = enableUserSchema.parse(input);

  const updated = await prisma.user.update({
    where: { id: validated.userId },
    data: { status: 'ACTIVE' },
  });

  revalidatePath('/admin/users');
  return { success: true, data: updated };
}

export async function adminDisableProject(input: unknown) {
  await requireAdmin();
  const validated = disableProjectSchema.parse(input);

  const updated = await prisma.project.update({
    where: { id: validated.projectId },
    data: { status: 'DISABLED' },
  });

  revalidatePath('/admin/projects');
  return { success: true, data: updated };
}

export async function approveProject(projectId: string) {
  await requireAdmin();

  await prisma.project.update({
    where: { id: projectId },
    data: { isApproved: true },
  });

  revalidatePath('/admin/projects');
  return { success: true };
}

export async function rejectProject(projectId: string, reason?: string) {
  await requireAdmin();

  await prisma.project.update({
    where: { id: projectId },
    data: {
      isApproved: false,
      status: 'DRAFT',
    },
  });

  revalidatePath('/admin/projects');
  return { success: true };
}
