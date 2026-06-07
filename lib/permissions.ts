import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const devUserId = process.env.NODE_ENV === 'development'
    ? cookies().get('dev_user_id')?.value
    : undefined;

  if (devUserId) {
    const devUser = await prisma.user.findUnique({ where: { id: devUserId } });

    if (!devUser || devUser.status === 'DISABLED') {
      throw new Error('使用者不存在或已被停用');
    }

    return devUser;
  }

  const { userId } = auth().protect();
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user || user.status === 'DISABLED') {
    throw new Error('使用者不存在或已被停用');
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('需要管理員權限');
  }
  return user;
}

export async function requireProjectOwner(projectId: string) {
  const user = await getCurrentUser();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('案件不存在');
  if (project.clientId !== user.id) {
    throw new Error('只有案件發案方可執行此操作');
  }
  return { user, project };
}

export async function requireAssignedFreelancer(projectId: string) {
  const user = await getCurrentUser();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('案件不存在');
  if (project.selectedFreelancerId !== user.id) {
    throw new Error('只有被指派的接案者可執行此操作');
  }
  return { user, project };
}

export function validateStateTransition(
  currentStatus: string,
  targetStatus: string,
  allowedTransitions: [string, string][]
): boolean {
  return allowedTransitions.some(
    ([from, to]) => from === currentStatus && to === targetStatus
  );
}

export const PROJECT_STATE_GUARD: Record<string, string[]> = {
  DRAFT: ['OPEN', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['COMPLETED', 'REVISION_REQUESTED'],
  REVISION_REQUESTED: ['SUBMITTED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  DISABLED: [],
};
