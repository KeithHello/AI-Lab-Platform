'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { syncCurrentClerkUser } from '@/lib/user-sync';
import { completeOnboardingSchema } from '@/lib/validations';

function resolveRole(canPostProjects: boolean, canApplyProjects: boolean) {
  if (canPostProjects && canApplyProjects) return 'BOTH';
  if (canPostProjects) return 'CLIENT';
  return 'FREELANCER';
}

async function validateActiveSkillTags(skillTagIds: string[]) {
  const activeSkillTags = await prisma.skillTag.findMany({
    where: {
      id: { in: skillTagIds },
      isActive: true,
    },
    select: { id: true },
  });

  if (activeSkillTags.length !== skillTagIds.length) {
    throw new Error('部分技能標籤已失效，請重新選擇。');
  }

  return activeSkillTags;
}

export async function completeOnboarding(input: unknown) {
  const { userId } = auth().protect();
  const clerkUser = await currentUser();
  const validated = completeOnboardingSchema.parse(input);
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  const name = validated.name || clerkUser?.fullName || email || 'New user';

  if (!email) {
    throw new Error('找不到目前登入帳號的 Email，請重新登入後再試一次。');
  }

  if (!validated.canPostProjects && !validated.canApplyProjects) {
    throw new Error('至少需要啟用一種平台使用方式。');
  }

  const user = await syncCurrentClerkUser(userId);

  if (user.status === 'DISABLED') {
    throw new Error('使用者帳號已被停用。');
  }

  const activeSkillTags = await validateActiveSkillTags(validated.skillTagIds);
  const role = resolveRole(validated.canPostProjects, validated.canApplyProjects);

  const reviewSetting = await prisma.reviewSetting.findUnique({
    where: { reviewType: 'USER_ONBOARDING' },
  });
  const status = reviewSetting?.isEnabled ? 'PENDING' : 'ACTIVE';

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        avatarUrl: clerkUser?.imageUrl ?? user.avatarUrl,
        bio: validated.bio || null,
        role,
        canPostProjects: validated.canPostProjects,
        canApplyProjects: validated.canApplyProjects,
        onboardingCompleted: true,
        status,
      },
    }),
    prisma.userSkill.deleteMany({ where: { userId: user.id } }),
    prisma.userSkill.createMany({
      data: activeSkillTags.map((tag) => ({
        userId: user.id,
        skillTagId: tag.id,
      })),
    }),
  ]);

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  redirect('/dashboard');
}

export async function updateUserSettings(input: unknown) {
  const validated = completeOnboardingSchema.parse(input);
  const user = await getCurrentUser();

  if (!validated.canPostProjects && !validated.canApplyProjects) {
    throw new Error('至少需要啟用一種平台使用方式。');
  }

  if (user.status === 'DISABLED') {
    throw new Error('使用者帳號已被停用。');
  }

  const activeSkillTags = await validateActiveSkillTags(validated.skillTagIds);
  const role = resolveRole(validated.canPostProjects, validated.canApplyProjects);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        name: validated.name,
        bio: validated.bio || null,
        role,
        canPostProjects: validated.canPostProjects,
        canApplyProjects: validated.canApplyProjects,
      },
    }),
    prisma.userSkill.deleteMany({ where: { userId: user.id } }),
    prisma.userSkill.createMany({
      data: activeSkillTags.map((tag) => ({
        userId: user.id,
        skillTagId: tag.id,
      })),
    }),
  ]);

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  revalidatePath('/projects');
  revalidatePath(`/users/${user.id}`);

  return { success: true };
}
