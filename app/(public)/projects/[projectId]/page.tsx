import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import ProjectDetail from '@/components/project/ProjectDetail';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { userId } = auth();
  const devUserId = process.env.NODE_ENV === 'development'
    ? cookies().get('dev_user_id')?.value
    : undefined;
  const [project, user] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        category: { select: { id: true, name: true } },
        projectSkills: {
          include: {
            skillTag: {
              select: { id: true, name: true, categoryId: true, isActive: true, createdAt: true, updatedAt: true },
            },
          },
        },
        client: { select: { id: true, name: true, avatarUrl: true } },
        selectedFreelancer: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    devUserId
      ? prisma.user.findUnique({
          where: { id: devUserId },
          select: { id: true, canPostProjects: true, canApplyProjects: true },
        })
      : userId
        ? prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, canPostProjects: true, canApplyProjects: true },
          })
        : Promise.resolve(null),
  ]);

  if (!project) notFound();

  const currentUserId = user?.id;
  const hasApplied = currentUserId
    ? !!(await prisma.application.findUnique({
        where: {
          projectId_freelancerId: {
            projectId: params.projectId,
            freelancerId: currentUserId,
          },
        },
        select: { id: true },
      }))
    : false;

  const serializedProject = {
    ...project,
    budget: Number(project.budget),
    deadline: project.deadline,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ProjectDetail
        project={serializedProject}
        currentUserId={currentUserId}
        currentUserCapabilities={user ? {
          canPostProjects: user.canPostProjects,
          canApplyProjects: user.canApplyProjects,
        } : undefined}
        hasApplied={hasApplied}
      />
    </div>
  );
}
