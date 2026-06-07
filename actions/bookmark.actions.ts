'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function toggleBookmark(projectId: string) {
  const user = await getCurrentUser();

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, bookmarked: false };
  }

  await prisma.bookmark.create({
    data: {
      userId: user.id,
      projectId,
    },
  });

  revalidatePath('/projects');
  revalidatePath('/dashboard');
  return { success: true, bookmarked: true };
}

export async function getBookmarks() {
  const user = await getCurrentUser();

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: {
          category: { select: { id: true, name: true } },
          projectSkills: { include: { skillTag: { select: { id: true, name: true } } } },
          client: { select: { name: true } },
          _count: { select: { applications: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookmarks.map((b) => ({
    id: b.project.id,
    title: b.project.title,
    category: b.project.category,
    skills: b.project.projectSkills.map((ps) => ps.skillTag),
    budget: Number(b.project.budget),
    currency: b.project.currency,
    deadline: b.project.deadline,
    status: b.project.status,
    applicationCount: b.project._count.applications,
    clientName: b.project.client.name,
    createdAt: b.project.createdAt,
  }));
}

export async function isBookmarked(projectId: string) {
  const user = await getCurrentUser();

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  return !!bookmark;
}

export async function getBookmarkedProjectIds() {
  const user = await getCurrentUser();

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });

  return bookmarks.map((b) => b.projectId);
}
