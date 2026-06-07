import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import EditProjectFormWrapper from './EditProjectFormWrapper';

export default async function EditProjectPage({ params }: { params: { projectId: string } }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/sign-in');

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      projectSkills: { include: { skillTag: true } },
    },
  });

  if (!project) notFound();
  if (project.clientId !== user.id) redirect(`/projects/${params.projectId}`);
  if (project.status !== 'DRAFT' && project.status !== 'OPEN') redirect(`/projects/${params.projectId}`);

  const serializedProject = {
    ...project,
    budget: Number(project.budget),
    deadline: project.deadline,
  };

  const categories = await prisma.category.findMany({ where: { isActive: true } }).catch(() => []);
  const skillTags = await prisma.skillTag.findMany({ where: { isActive: true } }).catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">編輯案件</h1>
      <EditProjectFormWrapper
        project={serializedProject}
        categories={categories}
        skillTags={skillTags}
      />
    </div>
  );
}
