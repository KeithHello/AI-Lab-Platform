'use server';

import { prisma } from '@/lib/prisma';
import { requireProjectOwner, requireAssignedFreelancer, PROJECT_STATE_GUARD } from '@/lib/permissions';
import { submitWorkSchema, acceptSubmissionSchema, requestRevisionSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function submitWork(input: unknown) {
  const { user, project } = await requireAssignedFreelancer(
    (input as { projectId: string }).projectId
  );
  const validated = submitWorkSchema.parse(input);

  if (!PROJECT_STATE_GUARD[project.status]?.includes('SUBMITTED')) {
    throw new Error(`無法從 ${project.status} 狀態提交成果`);
  }

  await prisma.$transaction([
    prisma.submission.create({
      data: {
        projectId: validated.projectId,
        freelancerId: user.id,
        description: validated.description,
        demoUrl: validated.demoUrl || null,
        githubUrl: validated.githubUrl || null,
        documentUrl: validated.documentUrl || null,
        fileUrls: validated.fileUrls.length > 0
          ? JSON.stringify(validated.fileUrls)
          : null,
      },
    }),
    prisma.project.update({
      where: { id: validated.projectId },
      data: { status: 'SUBMITTED' },
    }),
  ]);

  revalidatePath(`/projects/${validated.projectId}`);
  return { success: true };
}

export async function acceptSubmission(input: unknown) {
  const validated = acceptSubmissionSchema.parse(input);
  const { project } = await requireProjectOwner(validated.projectId);

  if (project.status !== 'SUBMITTED') {
    throw new Error('案件非已提交狀態，無法驗收');
  }

  await prisma.project.update({
    where: { id: validated.projectId },
    data: { status: 'COMPLETED' },
  });

  revalidatePath(`/projects/${validated.projectId}`);
  return { success: true };
}

export async function requestRevision(input: unknown) {
  const validated = requestRevisionSchema.parse(input);
  const { project } = await requireProjectOwner(validated.projectId);

  if (project.status !== 'SUBMITTED') {
    throw new Error('案件非已提交狀態，無法要求修改');
  }

  await prisma.project.update({
    where: { id: validated.projectId },
    data: {
      status: 'REVISION_REQUESTED',
      revisionReason: validated.reason,
      revisionCount: { increment: 1 },
    },
  });

  revalidatePath(`/projects/${validated.projectId}`);
  return { success: true };
}
