import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import ReviewWrapper from './ReviewWrapper';

export default async function ReviewPage({ params }: { params: { projectId: string } }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/sign-in');

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      client: { select: { id: true, name: true } },
      selectedFreelancer: { select: { id: true, name: true } },
    },
  });

  if (!project) notFound();
  if (project.status !== 'COMPLETED') redirect(`/projects/${params.projectId}`);

  const isClient = project.clientId === user.id;
  const isFreelancer = project.selectedFreelancerId === user.id;
  if (!isClient && !isFreelancer) redirect(`/projects/${params.projectId}`);

  const targetUserName = isClient ? project.selectedFreelancer?.name || '接案者' : project.client.name;

  // Check if user already reviewed
  const existingReview = await prisma.review.findFirst({
    where: {
      projectId: params.projectId,
      reviewerId: user.id,
    },
  });

  // Check if both reviews are in (double-blind reveal)
  const allReviews = await prisma.review.findMany({
    where: { projectId: params.projectId },
    include: {
      reviewer: { select: { name: true, avatarUrl: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">評價</h1>
      <ReviewWrapper
        projectId={params.projectId}
        targetUserName={targetUserName}
        existingReview={existingReview}
        allReviews={allReviews.length >= 2 ? allReviews : []}
      />
    </div>
  );
}
