'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin, requireProjectOwner, PROJECT_STATE_GUARD } from '@/lib/permissions';
import {
  createProjectSchema,
  updateProjectSchema,
  cancelProjectSchema,
  disableProjectSchema,
} from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(input: unknown) {
  const user = await getCurrentUser();
  const validated = createProjectSchema.parse(input);

  if (!user.canPostProjects) {
    throw new Error('你的帳號尚未開啟發案能力');
  }

  const reviewSetting = await prisma.reviewSetting.findUnique({
    where: { reviewType: 'PROJECT_PUBLISH' },
  });
  const isApproved = !reviewSetting?.isEnabled;

  const project = await prisma.project.create({
    data: {
      title: validated.title,
      categoryId: validated.categoryId,
      background: validated.background,
      description: validated.description,
      deliverables: validated.deliverables,
      acceptanceCriteria: validated.acceptanceCriteria,
      budget: validated.budget,
      currency: validated.currency,
      deadline: validated.deadline,
      confidentialityRequired: validated.confidentialityRequired,
      references: validated.references || null,
      clientId: user.id,
      status: validated.saveAsDraft ? 'DRAFT' : 'OPEN',
      isApproved: validated.saveAsDraft ? true : isApproved,
      projectSkills: {
        create: validated.skillTagIds.map((tagId) => ({
          skillTagId: tagId,
        })),
      },
    },
    include: { projectSkills: true },
  });

  revalidatePath('/projects');
  revalidatePath('/dashboard');
  redirect(`/projects/${project.id}`);
}

export async function updateProject(input: unknown) {
  const validated = updateProjectSchema.parse(input);
  const { user, project } = await requireProjectOwner(validated.projectId);

  if (project.status !== 'DRAFT' && project.status !== 'OPEN') {
    throw new Error('只能編輯草稿或開放申請中的案件');
  }

  const updated = await prisma.project.update({
    where: { id: validated.projectId },
    data: {
      ...(validated.title && { title: validated.title }),
      ...(validated.categoryId && { categoryId: validated.categoryId }),
      ...(validated.background && { background: validated.background }),
      ...(validated.description && { description: validated.description }),
      ...(validated.deliverables && { deliverables: validated.deliverables }),
      ...(validated.acceptanceCriteria && { acceptanceCriteria: validated.acceptanceCriteria }),
      ...(validated.budget !== undefined && { budget: validated.budget }),
      ...(validated.currency && { currency: validated.currency }),
      ...(validated.deadline && { deadline: validated.deadline }),
      ...(validated.confidentialityRequired !== undefined && { confidentialityRequired: validated.confidentialityRequired }),
      ...(validated.references !== undefined && { references: validated.references || null }),
    },
  });

  if (validated.skillTagIds) {
    await prisma.projectSkill.deleteMany({ where: { projectId: validated.projectId } });
    await prisma.projectSkill.createMany({
      data: validated.skillTagIds.map((tagId) => ({
        projectId: validated.projectId,
        skillTagId: tagId,
      })),
    });
  }

  revalidatePath(`/projects/${validated.projectId}`);
  return { success: true, data: updated };
}

export async function publishProject(projectId: string) {
  const { user, project } = await requireProjectOwner(projectId);

  if (!user.canPostProjects) {
    throw new Error('你的帳號尚未開啟發案能力');
  }

  if (project.status !== 'DRAFT') {
    throw new Error('只能發布草稿狀態的案件');
  }

  const reviewSetting = await prisma.reviewSetting.findUnique({
    where: { reviewType: 'PROJECT_PUBLISH' },
  });
  const isApproved = !reviewSetting?.isEnabled;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { status: 'OPEN', isApproved },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: updated };
}

export async function cancelProject(input: unknown) {
  const validated = cancelProjectSchema.parse(input);
  const { user, project } = await requireProjectOwner(validated.projectId);

  if (!PROJECT_STATE_GUARD[project.status]?.includes('CANCELLED')) {
    throw new Error(`無法從 ${project.status} 狀態取消案件`);
  }

  const updated = await prisma.project.update({
    where: { id: validated.projectId },
    data: { status: 'CANCELLED' },
  });

  revalidatePath(`/projects/${validated.projectId}`);
  return { success: true, data: updated };
}

export async function disableProject(input: unknown) {
  const validated = disableProjectSchema.parse(input);
  await requireAdmin();

  const updated = await prisma.project.update({
    where: { id: validated.projectId },
    data: { status: 'DISABLED' },
  });

  revalidatePath(`/projects/${validated.projectId}`);
  revalidatePath('/admin/projects');
  return { success: true, data: updated };
}
