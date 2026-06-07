'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';
import { applyProjectSchema, selectFreelancerSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function applyProject(input: unknown) {
  const user = await getCurrentUser();
  const validated = applyProjectSchema.parse(input);

  if (!user.canApplyProjects) {
    throw new Error('你的帳號尚未開啟接案能力');
  }

  const project = await prisma.project.findUnique({
    where: { id: validated.projectId },
  });

  if (!project) throw new Error('案件不存在');
  if (project.status !== 'OPEN') throw new Error('案件非開放申請狀態');
  if (project.clientId === user.id) throw new Error('無法申請自己的案件');

  const existing = await prisma.application.findUnique({
    where: {
      projectId_freelancerId: {
        projectId: validated.projectId,
        freelancerId: user.id,
      },
    },
  });

  if (existing) throw new Error('你已經申請過此案件');

  const application = await prisma.application.create({
    data: {
      projectId: validated.projectId,
      freelancerId: user.id,
      description: validated.description,
      approach: validated.approach,
      estimatedDays: validated.estimatedDays,
      portfolioUrls: validated.portfolioUrls.length > 0
        ? JSON.stringify(validated.portfolioUrls)
        : null,
    },
  });

  revalidatePath(`/projects/${validated.projectId}`);
  revalidatePath(`/projects/${validated.projectId}/applications`);
  return { success: true, data: application };
}

export async function selectFreelancer(input: unknown) {
  const user = await getCurrentUser();
  const validated = selectFreelancerSchema.parse(input);

  const project = await prisma.project.findUnique({
    where: { id: validated.projectId },
  });

  if (!project) throw new Error('案件不存在');
  if (project.clientId !== user.id) throw new Error('只有案件發案方可選擇接案者');
  if (project.status !== 'OPEN') throw new Error('案件非開放申請狀態');

  const application = await prisma.application.findUnique({
    where: {
      projectId_freelancerId: {
        projectId: validated.projectId,
        freelancerId: validated.freelancerId,
      },
    },
  });

  if (!application) throw new Error('找不到該申請記錄');

  await prisma.$transaction([
    prisma.project.update({
      where: { id: validated.projectId },
      data: {
        status: 'IN_PROGRESS',
        selectedFreelancerId: validated.freelancerId,
      },
    }),
    prisma.application.update({
      where: { id: application.id },
      data: { status: 'ACCEPTED' },
    }),
    prisma.application.updateMany({
      where: {
        projectId: validated.projectId,
        freelancerId: { not: validated.freelancerId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    }),
  ]);

  revalidatePath(`/projects/${validated.projectId}`);
  revalidatePath(`/projects/${validated.projectId}/applications`);
  return { success: true };
}
