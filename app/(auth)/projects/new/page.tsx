import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProjectFormWrapper from './ProjectFormWrapper';
import { getCurrentUser } from '@/lib/permissions';

export default async function NewProjectPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect('/sign-in');
  }

  if (!user || !user.onboardingCompleted) redirect('/onboarding');
  if (!user.canPostProjects) redirect('/dashboard');

  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []);
  const skillTags = await prisma.skillTag.findMany({ where: { isActive: true } }).catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">發布案件</h1>
      <ProjectFormWrapper categories={categories} skillTags={skillTags} />
    </div>
  );
}
