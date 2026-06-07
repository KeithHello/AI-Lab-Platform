import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import ReviewSubmissionWrapper from './ReviewSubmissionWrapper';

export default async function ReviewSubmissionPage({ params }: { params: { projectId: string } }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/sign-in');

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
  });

  if (!project) notFound();
  if (project.clientId !== user.id) redirect(`/projects/${params.projectId}`);
  if (project.status !== 'SUBMITTED') redirect(`/projects/${params.projectId}`);

  const serializedProject = {
    ...project,
    budget: Number(project.budget),
    deadline: project.deadline,
  };

  const submission = await prisma.submission.findFirst({
    where: { projectId: params.projectId },
    orderBy: { createdAt: 'desc' },
  });

  if (!submission) redirect(`/projects/${params.projectId}`);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">驗收成果</h1>
      <ReviewSubmissionWrapper project={serializedProject} submission={submission} />
    </div>
  );
}
