'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin } from '@/lib/permissions';
import { createDisputeSchema, updateDisputeSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getDisputes() {
  await requireAdmin();
  return prisma.dispute.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, title: true } },
      reporter: { select: { id: true, name: true, email: true } },
      respondent: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createDispute(input: unknown) {
  const user = await getCurrentUser();
  const validated = createDisputeSchema.parse(input);

  const project = await prisma.project.findUnique({
    where: { id: validated.projectId },
  });
  if (!project) throw new Error('案件不存在');

  if (!project.selectedFreelancerId) {
    throw new Error('案件尚未選定接案方，無法提出糾紛');
  }

  const isClient = project.clientId === user.id;
  const isFreelancer = project.selectedFreelancerId === user.id;

  if (!isClient && !isFreelancer) {
    throw new Error('只有合作中的發案方或接案方可以提出糾紛');
  }

  const respondentId = isClient ? project.selectedFreelancerId : project.clientId;

  const dispute = await prisma.dispute.create({
    data: {
      projectId: validated.projectId,
      reporterId: user.id,
      respondentId,
      type: validated.type,
      description: validated.description,
    },
  });

  revalidatePath('/admin/disputes');
  revalidatePath(`/projects/${validated.projectId}`);
  return { success: true, data: dispute };
}

export async function updateDispute(input: unknown) {
  await requireAdmin();
  const validated = updateDisputeSchema.parse(input);

  const dispute = await prisma.dispute.findUnique({
    where: { id: validated.disputeId },
  });
  if (!dispute) throw new Error('糾紛不存在');

  const updated = await prisma.dispute.update({
    where: { id: validated.disputeId },
    data: {
      ...(validated.respondentStatement !== undefined && { respondentStatement: validated.respondentStatement }),
      status: validated.status,
      ...(validated.resolution !== undefined && { resolution: validated.resolution }),
    },
  });

  revalidatePath('/admin/disputes');
  return { success: true, data: updated };
}
