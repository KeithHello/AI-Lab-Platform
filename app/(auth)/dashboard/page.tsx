import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProjectStatus } from '@prisma/client';
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Heart,
  Plus,
  Search,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import DashboardWorkspaceTabs from '@/components/dashboard/DashboardWorkspaceTabs';
import ProjectCard from '@/components/project/ProjectCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCardData } from '@/types';

type ProjectForCard = {
  id: string;
  title: string;
  budget: unknown;
  currency: ProjectCardData['currency'];
  deadline: Date;
  status: ProjectCardData['status'];
  createdAt: Date;
  category: { id: string; name: string };
  projectSkills: { skillTag: { id: string; name: string } }[];
  client: { name: string };
  _count: { applications: number };
};

function toProjectCardData(project: ProjectForCard): ProjectCardData {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    skills: project.projectSkills.map((ps) => ps.skillTag),
    budget: Number(project.budget),
    currency: project.currency,
    deadline: project.deadline,
    status: project.status,
    applicationCount: project._count.applications,
    clientName: project.client.name,
    createdAt: project.createdAt,
  };
}

const projectCardSelect = {
  id: true,
  title: true,
  budget: true,
  currency: true,
  deadline: true,
  status: true,
  createdAt: true,
  category: { select: { id: true, name: true } },
  projectSkills: { select: { skillTag: { select: { id: true, name: true } } } },
  client: { select: { name: true } },
  _count: { select: { applications: true } },
} as const;

const applicationStatusLabel = {
  PENDING: '審核中',
  ACCEPTED: '已接受',
  REJECTED: '未入選',
} as const;

const applicationStatusVariant = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'secondary',
} as const;

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1 border-b pb-3">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function EmptySection({
  text,
  href,
  action,
}: {
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <Card className="rounded-xl border-dashed border-border/80">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">{text}</p>
        {href && action && (
          <Link href={href}>
            <Button variant="outline" size="sm">{action}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Briefcase;
}) {
  return (
    <Card className="rounded-xl border border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/30 p-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function WorkspaceCard({
  title,
  description,
  badge,
  stats,
}: {
  title: string;
  description: string;
  badge: string;
  stats: Array<{ label: string; value: number }>;
}) {
  return (
    <Card className="rounded-xl border border-border/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline">{badge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
            <div className="mt-2 text-2xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }

  const canPostProjects = user.canPostProjects;
  const canApplyProjects = user.canApplyProjects;
  const isBoth = canPostProjects && canApplyProjects;

  const [
    ownedProjectCount,
    incomingPendingApplicationCount,
    clientReviewQueueCount,
    applicationCount,
    pendingApplicationCount,
    assignedProjectCount,
    pendingFreelancerReviewCount,
    bookmarkCount,
    ownedProjects,
    reviewQueueProjects,
    applications,
    assignedProjects,
    bookmarkRows,
  ] = await Promise.all([
    canPostProjects
      ? prisma.project.count({ where: { clientId: user.id } })
      : Promise.resolve(0),
    canPostProjects
      ? prisma.application.count({
          where: {
            status: 'PENDING',
            project: { clientId: user.id },
          },
        })
      : Promise.resolve(0),
    canPostProjects
      ? prisma.project.count({
          where: {
            clientId: user.id,
            status: 'SUBMITTED',
          },
        })
      : Promise.resolve(0),
    canApplyProjects
      ? prisma.application.count({ where: { freelancerId: user.id } })
      : Promise.resolve(0),
    canApplyProjects
      ? prisma.application.count({
          where: { freelancerId: user.id, status: 'PENDING' },
        })
      : Promise.resolve(0),
    canApplyProjects
      ? prisma.project.count({
          where: {
            selectedFreelancerId: user.id,
            status: { in: [ProjectStatus.IN_PROGRESS, ProjectStatus.SUBMITTED, ProjectStatus.REVISION_REQUESTED] },
          },
        })
      : Promise.resolve(0),
    canApplyProjects
      ? prisma.project.count({
          where: {
            selectedFreelancerId: user.id,
            status: 'COMPLETED',
            reviews: {
              none: { reviewerId: user.id },
            },
          },
        })
      : Promise.resolve(0),
    prisma.bookmark.count({ where: { userId: user.id } }),
    canPostProjects
      ? prisma.project.findMany({
          where: { clientId: user.id },
          select: projectCardSelect,
          orderBy: { createdAt: 'desc' },
          take: 6,
        })
      : Promise.resolve([]),
    canPostProjects
      ? prisma.project.findMany({
          where: {
            clientId: user.id,
            status: 'SUBMITTED',
          },
          select: projectCardSelect,
          orderBy: { updatedAt: 'desc' },
          take: 6,
        })
      : Promise.resolve([]),
    canApplyProjects
      ? prisma.application.findMany({
          where: { freelancerId: user.id },
          select: {
            id: true,
            status: true,
            createdAt: true,
            project: { select: projectCardSelect },
          },
          orderBy: { createdAt: 'desc' },
          take: 6,
        })
      : Promise.resolve([]),
    canApplyProjects
      ? prisma.project.findMany({
          where: {
            selectedFreelancerId: user.id,
            status: { in: [ProjectStatus.IN_PROGRESS, ProjectStatus.SUBMITTED, ProjectStatus.REVISION_REQUESTED] },
          },
          select: projectCardSelect,
          orderBy: { updatedAt: 'desc' },
          take: 6,
        })
      : Promise.resolve([]),
    canApplyProjects
      ? prisma.bookmark.findMany({
          where: { userId: user.id },
          select: {
            createdAt: true,
            project: { select: projectCardSelect },
          },
          orderBy: { createdAt: 'desc' },
          take: 6,
        })
      : Promise.resolve([]),
  ]);

  const modeLabel = isBoth ? '發案 / 接案' : canPostProjects ? '發案方' : '接案方';
  const welcomeCopy = isBoth
    ? '你現在同時擁有發案與接案能力，下面會分成兩個工作台，讓你在不同情境下都能快速找到重點。'
    : canPostProjects
      ? '這裡優先顯示與發案、申請管理、驗收流程有關的資訊。'
      : '這裡優先顯示與申請案件、進行中合作、收藏追蹤有關的資訊。';

  const statCards = isBoth
    ? [
        { title: '我的案件', value: ownedProjectCount, description: '你發布的案件總數', icon: Briefcase },
        { title: '待處理申請', value: incomingPendingApplicationCount, description: '等你決定的申請', icon: Users },
        { title: '進行中接案', value: assignedProjectCount, description: '你正在合作的案件', icon: ClipboardList },
        { title: '收藏案件', value: bookmarkCount, description: '之後想再回看的案件', icon: Heart },
      ]
    : canPostProjects
      ? [
          { title: '我的案件', value: ownedProjectCount, description: '你發布的案件總數', icon: Briefcase },
          { title: '待處理申請', value: incomingPendingApplicationCount, description: '等你決定的申請', icon: Users },
          { title: '待驗收案件', value: clientReviewQueueCount, description: '已提交成果，等你驗收', icon: CheckCircle2 },
        ]
      : [
          { title: '我的申請', value: applicationCount, description: '你已送出的申請', icon: ClipboardList },
          { title: '待回覆申請', value: pendingApplicationCount, description: '還在等待結果的申請', icon: Sparkles },
          { title: '進行中案件', value: assignedProjectCount, description: '已開始合作的案件', icon: Briefcase },
          { title: '收藏案件', value: bookmarkCount, description: '之後想再回看的案件', icon: Heart },
        ];

  const clientWorkspaceSection = canPostProjects ? (
    <section className="flex flex-col gap-5">
      {!isBoth && (
        <SectionHeader
          title="我的案件"
          description="優先處理申請者與待驗收的案件。"
        />
      )}

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">最近發布案件</h3>
            <p className="text-sm text-muted-foreground">快速查看你最近建立或更新過的案件。</p>
          </div>
          {ownedProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {ownedProjects.map((project) => (
                <ProjectCard key={project.id} project={toProjectCardData(project)} showBookmark={false} />
              ))}
            </div>
          ) : (
            <EmptySection text="你還沒有發布任何案件。" href="/projects/new" action="發布第一個案件" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">待驗收案件</h3>
            <p className="text-sm text-muted-foreground">接案方已提交成果，這裡方便你集中確認。</p>
          </div>
          {reviewQueueProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reviewQueueProjects.map((project) => (
                <ProjectCard key={project.id} project={toProjectCardData(project)} showBookmark={false} />
              ))}
            </div>
          ) : (
            <EmptySection text="目前沒有待驗收的案件。" />
          )}
        </div>
      </div>
    </section>
  ) : null;

  const freelancerWorkspaceSection = canApplyProjects ? (
    <section className="flex flex-col gap-5">
      {!isBoth && (
        <SectionHeader
          title="我的接案工作台"
          description="優先顯示你正在追蹤與執行的案件。"
        />
      )}

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">我的申請</h3>
            <p className="text-sm text-muted-foreground">包含審核中、已接受與未入選的申請記錄。</p>
          </div>
          {applications.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {applications.map((application) => (
                <div key={application.id} className="relative">
                  <div className="absolute right-4 top-4 z-10">
                    <Badge variant={applicationStatusVariant[application.status]}>
                      {applicationStatusLabel[application.status]}
                    </Badge>
                  </div>
                  <ProjectCard project={toProjectCardData(application.project)} showBookmark={false} />
                </div>
              ))}
            </div>
          ) : (
            <EmptySection text="你還沒有申請任何案件。" href="/projects" action="去看看案件" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">進行中案件</h3>
            <p className="text-sm text-muted-foreground">已經開始合作的案件會優先集中在這裡。</p>
          </div>
          {assignedProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {assignedProjects.map((project) => (
                <ProjectCard key={project.id} project={toProjectCardData(project)} showBookmark={false} />
              ))}
            </div>
          ) : (
            <EmptySection text="目前沒有進行中的接案案件。" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">收藏案件</h3>
            <p className="text-sm text-muted-foreground">先收藏，之後再回來比較與申請。</p>
          </div>
          {bookmarkRows.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {bookmarkRows.map((bookmark) => (
                <ProjectCard key={bookmark.project.id} project={toProjectCardData(bookmark.project)} isBookmarked />
              ))}
            </div>
          ) : (
            <EmptySection text="你還沒有收藏任何案件。" href="/projects" action="瀏覽案件" />
          )}
        </div>
      </div>
    </section>
  ) : null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="rounded-2xl border border-border/60 shadow-sm">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit">{modeLabel}</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {user.name} 的工作台
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{welcomeCopy}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {canPostProjects && (
                <Link href="/projects/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    發布案件
                  </Button>
                </Link>
              )}
              <Link href="/projects">
                <Button variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  瀏覽案件
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="gap-2">
                  <UserCog className="h-4 w-4" />
                  個人設定
                </Button>
              </Link>
              {user.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="gap-2">
                    進入管理後台
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">目前能力</CardTitle>
            <CardDescription>這些設定會影響導覽列、dashboard 與案件操作權限。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="text-sm font-medium text-foreground">發案能力</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {canPostProjects ? '已啟用，可發布案件與管理合作流程。' : '未啟用。'}
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="text-sm font-medium text-foreground">接案能力</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {canApplyProjects ? '已啟用，可申請案件與提交成果。' : '未啟用。'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-4 ${statCards.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {isBoth && (
        <DashboardWorkspaceTabs
          clientSummary={
            <WorkspaceCard
              title="發案工作台"
              description="聚焦案件進度、申請變化與驗收節奏。"
              badge="Client mode"
              stats={[
                { label: '我的案件', value: ownedProjectCount },
                { label: '待處理申請', value: incomingPendingApplicationCount },
                { label: '待驗收案件', value: clientReviewQueueCount },
              ]}
            />
          }
          clientContent={clientWorkspaceSection}
          freelancerSummary={
            <WorkspaceCard
              title="接案工作台"
              description="聚焦投遞進度、合作案件與後續追蹤。"
              badge="Freelancer mode"
              stats={[
                { label: '我的申請', value: applicationCount },
                { label: '進行中案件', value: assignedProjectCount },
                { label: '待評價案件', value: pendingFreelancerReviewCount },
              ]}
            />
          }
          freelancerContent={freelancerWorkspaceSection}
        />
      )}

      {!isBoth && clientWorkspaceSection}
      {!isBoth && freelancerWorkspaceSection}
    </div>
  );
}
