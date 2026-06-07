import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import SubmitWorkWrapper from './SubmitWorkWrapper';

export default async function SubmitWorkPage({ params }: { params: { projectId: string } }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || !user.onboardingCompleted) redirect('/onboarding');

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
  });

  if (!project) notFound();
  if (project.selectedFreelancerId !== user.id) redirect(`/projects/${params.projectId}`);
  if (project.status !== 'IN_PROGRESS' && project.status !== 'REVISION_REQUESTED') redirect(`/projects/${params.projectId}`);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">提交成果</h1>
      <p className="text-muted-foreground mb-8">案件：{project.title}</p>
      {project.revisionReason && (
        <div className="mb-6 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
          <h4 className="font-medium text-yellow-800">修改要求 (#{project.revisionCount})</h4>
          <p className="text-sm text-yellow-700 mt-1">{project.revisionReason}</p>
        </div>
      )}
      <SubmitWorkWrapper projectId={params.projectId} />
    </div>
  );
}
