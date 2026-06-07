'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import {
  createSkillTagSchema,
  updateSkillTagSchema,
  deleteSkillTagSchema,
} from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getSkillTags() {
  await requireAdmin();
  return prisma.skillTag.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function createSkillTag(input: unknown) {
  await requireAdmin();
  const validated = createSkillTagSchema.parse(input);

  const skillTag = await prisma.skillTag.create({
    data: {
      name: validated.name,
      categoryId: validated.categoryId || null,
    },
  });

  revalidatePath('/admin/skill-tags');
  return { success: true, data: skillTag };
}

export async function updateSkillTag(input: unknown) {
  await requireAdmin();
  const validated = updateSkillTagSchema.parse(input);

  const updated = await prisma.skillTag.update({
    where: { id: validated.skillTagId },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.categoryId !== undefined && { categoryId: validated.categoryId }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    },
  });

  revalidatePath('/admin/skill-tags');
  return { success: true, data: updated };
}

export async function deleteSkillTag(input: unknown) {
  await requireAdmin();
  const validated = deleteSkillTagSchema.parse(input);

  await prisma.skillTag.delete({
    where: { id: validated.skillTagId },
  });

  revalidatePath('/admin/skill-tags');
  return { success: true };
}
