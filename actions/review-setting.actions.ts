'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import { updateReviewSettingSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getReviewSettings() {
  await requireAdmin();
  return prisma.reviewSetting.findMany();
}

export async function updateReviewSetting(input: unknown) {
  await requireAdmin();
  const validated = updateReviewSettingSchema.parse(input);

  const setting = await prisma.reviewSetting.upsert({
    where: { reviewType: validated.reviewType },
    update: { isEnabled: validated.isEnabled },
    create: {
      reviewType: validated.reviewType,
      isEnabled: validated.isEnabled,
    },
  });

  revalidatePath('/admin/settings');
  return { success: true, data: setting };
}
