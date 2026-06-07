import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import ApplyProjectWrapper from './ApplyProjectWrapper';

export default async function ApplyProjectPage({ params }: { params: { projectId: string } }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || !user.onboardingCompleted) redirect('/onboarding');

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
  });

  if (!project) notFound();
  if (project.status !== 'OPEN') redirect(`/projects/${params.projectId}`);
  if (project.clientId === user.id) redirect(`/projects/${params.projectId}`);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">申請案件</h1>
      <p className="text-muted-foreground mb-8">{project.title}</p>
      <ApplyProjectWrapper projectId={params.projectId} />
    </div>
  );
}
