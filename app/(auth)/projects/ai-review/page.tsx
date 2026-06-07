import { redirect } from 'next/navigation';
import ProjectReviewWorkspace from '@/components/project/ProjectReviewWorkspace';
import { getCurrentUser } from '@/lib/permissions';

export default async function ProjectAiReviewPage() {
  try {
    const user = await getCurrentUser();
    if (!user.onboardingCompleted) {
      redirect('/onboarding');
    }
  } catch {
    redirect('/sign-in');
  }

  return <ProjectReviewWorkspace />;
}
