'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  await requireAdmin();
  return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createCategory(input: unknown) {
  await requireAdmin();
  const validated = createCategorySchema.parse(input);

  const category = await prisma.category.create({
    data: {
      name: validated.name,
      description: validated.description || null,
      sortOrder: validated.sortOrder,
    },
  });

  revalidatePath('/admin/categories');
  return { success: true, data: category };
}

export async function updateCategory(input: unknown) {
  await requireAdmin();
  const validated = updateCategorySchema.parse(input);

  const updated = await prisma.category.update({
    where: { id: validated.categoryId },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.sortOrder !== undefined && { sortOrder: validated.sortOrder }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    },
  });

  revalidatePath('/admin/categories');
  return { success: true, data: updated };
}

export async function deleteCategory(input: unknown) {
  await requireAdmin();
  const validated = deleteCategorySchema.parse(input);

  await prisma.category.delete({
    where: { id: validated.categoryId },
  });

  revalidatePath('/admin/categories');
  return { success: true };
}
