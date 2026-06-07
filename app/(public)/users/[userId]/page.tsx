import { prisma } from '@/lib/prisma';
import UserProfile from '@/components/user/UserProfile';
import { notFound } from 'next/navigation';

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      role: true,
      canPostProjects: true,
      canApplyProjects: true,
      status: true,
      createdAt: true,
      skills: {
        include: { skillTag: { select: { id: true, name: true } } },
      },
    },
  });

  if (!user || user.status === 'DISABLED') notFound();

  // 取得統計數據
  const [completedAsClient, completedAsFreelancer, receivedReviews] = await Promise.all([
    prisma.project.count({
      where: { clientId: user.id, status: 'COMPLETED' },
    }),
    prisma.project.count({
      where: { selectedFreelancerId: user.id, status: 'COMPLETED' },
    }),
    prisma.review.findMany({
      where: { revieweeId: user.id },
      include: {
        reviewer: { select: { name: true, avatarUrl: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // 只顯示雙方都已評價的評價（雙盲規則）
  const visibleReviews = [];
  for (const review of receivedReviews) {
    const counterReview = await prisma.review.findFirst({
      where: {
        projectId: review.projectId,
        reviewerId: review.revieweeId,
        revieweeId: review.reviewerId,
      },
    });
    if (counterReview) {
      visibleReviews.push(review);
    }
  }

  const totalReviews = visibleReviews.length;
  const averageRating = totalReviews > 0
    ? visibleReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const collaborateAgainCount = visibleReviews.filter((r) => r.wouldCollaborateAgain).length;
  const collaborateAgainRate = totalReviews > 0 ? (collaborateAgainCount / totalReviews) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UserProfile
        user={{
          ...user,
          skills: user.skills.map((s) => s.skillTag),
        }}
        stats={{
          completedProjects: completedAsClient + completedAsFreelancer,
          averageRating,
          totalReviews,
          collaborateAgainRate,
        }}
        reviews={visibleReviews}
      />
    </div>
  );
}
