import { redirect } from 'next/navigation';
import AccountSettingsForm from '@/components/user/AccountSettingsForm';
import { getCurrentUser } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }

  const [skillTags, userSkills] = await Promise.all([
    prisma.skillTag.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.userSkill.findMany({
      where: { userId: user.id },
      select: { skillTagId: true },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="space-y-2 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">個人設定</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          這裡保留 onboarding 的核心設定，之後可以隨時回來調整你的公開資料、技能標籤與平台使用方式。
        </p>
      </div>

      <AccountSettingsForm
        skillTags={skillTags}
        defaultValues={{
          name: user.name,
          bio: user.bio || '',
          canPostProjects: user.canPostProjects,
          canApplyProjects: user.canApplyProjects,
          skillTagIds: userSkills.map((skill) => skill.skillTagId),
        }}
      />
    </div>
  );
}
