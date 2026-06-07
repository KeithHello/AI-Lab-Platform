'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';
import { submitReviewSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function submitReview(input: unknown) {
  const user = await getCurrentUser();
  const validated = submitReviewSchema.parse(input);

  const project = await prisma.project.findUnique({
    where: { id: validated.projectId },
  });

  if (!project) throw new Error('案件不存在');
  if (project.status !== 'COMPLETED') throw new Error('案件尚未完成，無法評價');

  const isClient = project.clientId === user.id;
  const isFreelancer = project.selectedFreelancerId === user.id;

  if (!isClient && !isFreelancer) {
    throw new Error('只有案件發案方或被選中的接案者可以評價');
  }

  const revieweeId = isClient ? project.selectedFreelancerId! : project.clientId;

  const existing = await prisma.review.findUnique({
    where: {
      projectId_reviewerId_revieweeId: {
        projectId: validated.projectId,
        reviewerId: user.id,
        revieweeId,
      },
    },
  });

  if (existing) throw new Error('你已經對此案件進行過評價');

  const review = await prisma.review.create({
    data: {
      projectId: validated.projectId,
      reviewerId: user.id,
      revieweeId,
      rating: validated.rating,
      comment: validated.comment || null,
      wouldCollaborateAgain: validated.wouldCollaborateAgain,
    },
  });

  // Check if both parties have submitted reviews (double-blind)
  const bothReviewsSubmitted = await prisma.review.findMany({
    where: {
      projectId: validated.projectId,
      reviewerId: { in: [project.clientId, project.selectedFreelancerId!].filter(Boolean) },
    },
  });

  revalidatePath(`/projects/${validated.projectId}`);

  // If both submitted, reveal both reviews
  if (bothReviewsSubmitted.length === 2) {
    return {
      success: true,
      data: {
        review,
        bothSubmitted: true,
        allReviews: bothReviewsSubmitted,
      },
    };
  }

  return {
    success: true,
    data: {
      review,
      bothSubmitted: false,
      message: '評價已提交，待對方完成評價後互相可見',
    },
  };
}
