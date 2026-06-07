import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import ApplicantCard from '@/components/project/ApplicantCard';
import SelectFreelancerWrapper from './SelectFreelancerWrapper';

export default async function ApplicationsPage({ params }: { params: { projectId: string } }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/sign-in');

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
  });
  if (!project) notFound();
  if (project.clientId !== user.id) redirect(`/projects/${params.projectId}`);

  const applications = await prisma.application.findMany({
    where: { projectId: params.projectId },
    include: {
      freelancer: {
        include: {
          skills: {
            include: { skillTag: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">申請者列表</h1>
      <p className="text-muted-foreground mb-8">案件：{project.title}</p>

      {project.status === 'OPEN' ? (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">尚無申請者</p>
          ) : (
            applications.map((app) => (
              <SelectFreelancerWrapper
                key={app.id}
                application={app}
                projectId={params.projectId}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">尚無申請記錄</p>
          ) : (
            applications.map((app) => (
              <ApplicantCard key={app.id} application={app} disabled />
            ))
          )}
        </div>
      )}
    </div>
  );
}
