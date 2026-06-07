'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProjectStatusBadge from './ProjectStatusBadge';
import { formatCurrency, Currency } from '@/lib/currency';
import { Project, Category, SkillTag, User } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, ExternalLink, Star, Award, ShieldCheck } from 'lucide-react';
import ProjectSupportActions from './ProjectSupportActions';

interface ProjectDetailProps {
  project: Project & {
    category: Pick<Category, 'id' | 'name'>;
    projectSkills: { skillTag: SkillTag }[];
    client: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    selectedFreelancer?: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
  };
  currentUserId?: string;
  currentUserCapabilities?: {
    canPostProjects: boolean;
    canApplyProjects: boolean;
  };
  hasApplied?: boolean;
}

export default function ProjectDetail({ project, currentUserId, currentUserCapabilities, hasApplied }: ProjectDetailProps) {
  const isOwner = currentUserId === project.clientId;
  const isFreelancer = currentUserId === project.selectedFreelancerId;
  const canApply = !!currentUserCapabilities?.canApplyProjects && !isOwner && !hasApplied && project.status === 'OPEN';
  const canEdit = !!currentUserCapabilities?.canPostProjects && isOwner && (project.status === 'DRAFT' || project.status === 'OPEN');
  const canSubmit = isFreelancer && (project.status === 'IN_PROGRESS' || project.status === 'REVISION_REQUESTED');
  const canReview = isOwner && project.status === 'SUBMITTED';
  const canReviewEach = project.status === 'COMPLETED';
  const canCreateDispute =
    (isOwner || isFreelancer) &&
    !!project.selectedFreelancerId &&
    ['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'COMPLETED'].includes(project.status);
  const reportTarget = currentUserId
    ? isOwner && project.selectedFreelancer
      ? { id: project.selectedFreelancer.id, name: project.selectedFreelancer.name, roleLabel: '接案方' }
      : !isOwner
        ? { id: project.client.id, name: project.client.name, roleLabel: '發案方' }
        : undefined
    : undefined;

  // Deterministic helper for mock client stats
  const getClientStats = (clientId: string) => {
    let sum = 0;
    for (let i = 0; i < clientId.length; i++) {
      sum += clientId.charCodeAt(i);
    }
    const rating = (4.5 + (sum % 6) * 0.1).toFixed(1); // 4.5 to 5.0
    const reviewCount = 5 + (sum % 45); // 5 to 49 reviews
    const completionRate = 90 + (sum % 11); // 90% to 100%
    const joinedYear = 2023 + (sum % 3); // 2023 to 2025
    return { rating, reviewCount, completionRate, joinedYear };
  };

  const clientStats = getClientStats(project.clientId);

  return (
    <div className="space-y-6">
      {/* Back to Projects */}
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer mb-2">
        <ArrowLeft className="h-4 w-4" />
        返回案件列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-foreground font-mono">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              <Badge variant="secondary" className="font-mono text-xs">{project.category.name}</Badge>
            </div>
            
            {/* Skill Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.projectSkills.map((ps) => (
                <Badge key={ps.skillTag.id} variant="outline" className="font-mono text-xs bg-card">
                  {ps.skillTag.name}
                </Badge>
              ))}
            </div>
          </div>

          {project.revisionReason && (
            <Card className="border-yellow-200 bg-yellow-50/50 rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-800 text-base font-bold font-mono">
                  修改要求 (#{project.revisionCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700 whitespace-pre-wrap">{project.revisionReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Details Sections */}
          <div className="space-y-6">
            <Card className="rounded-xl border border-border/60">
              <CardHeader className="border-b bg-muted/20 py-4"><CardTitle className="text-base font-bold font-mono">案件背景</CardTitle></CardHeader>
              <CardContent className="pt-6"><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{project.background}</p></CardContent>
            </Card>

            <Card className="rounded-xl border border-border/60">
              <CardHeader className="border-b bg-muted/20 py-4"><CardTitle className="text-base font-bold font-mono">案件敘述</CardTitle></CardHeader>
              <CardContent className="pt-6"><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{project.description}</p></CardContent>
            </Card>

            <Card className="rounded-xl border border-border/60">
              <CardHeader className="border-b bg-muted/20 py-4"><CardTitle className="text-base font-bold font-mono">交付成果</CardTitle></CardHeader>
              <CardContent className="pt-6"><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{project.deliverables}</p></CardContent>
            </Card>

            <Card className="rounded-xl border border-border/60">
              <CardHeader className="border-b bg-muted/20 py-4"><CardTitle className="text-base font-bold font-mono">驗收標準</CardTitle></CardHeader>
              <CardContent className="pt-6"><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{project.acceptanceCriteria}</p></CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column / Sticky Sidebar (30%) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
          {/* Action & Price Card */}
          <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
            <div className="bg-primary/5 border-b border-border/60 p-6 text-center space-y-1">
              <span className="text-xs font-bold font-mono text-primary uppercase tracking-wider">專案預算</span>
              <div className="text-3xl font-extrabold text-primary font-mono">
                {formatCurrency(Number(project.budget), project.currency as Currency)}
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3.5 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>截止日期</span>
                  </div>
                  <span className="font-mono text-foreground font-semibold">
                    {new Date(project.deadline).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>目前狀態</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {project.status === 'OPEN' ? '開放應徵中' : '已關閉/進行中'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                {canApply && (
                  <Link href={`/projects/${project.id}/apply`} className="w-full">
                    <Button className="w-full h-11 font-semibold cursor-pointer shadow-sm">申請案件</Button>
                  </Link>
                )}
                {canEdit && (
                  <Link href={`/projects/${project.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full h-11 font-semibold cursor-pointer">編輯案件</Button>
                  </Link>
                )}
                {canSubmit && (
                  <Link href={`/projects/${project.id}/submit`} className="w-full">
                    <Button className="w-full h-11 font-semibold cursor-pointer shadow-sm">提交成果</Button>
                  </Link>
                )}
                {canReview && (
                  <Link href={`/projects/${project.id}/review-submission`} className="w-full">
                    <Button variant="outline" className="w-full h-11 font-semibold cursor-pointer">驗收成果</Button>
                  </Link>
                )}
                {canReviewEach && (
                  <Link href={`/projects/${project.id}/review`} className="w-full">
                    <Button variant="outline" className="w-full h-11 font-semibold cursor-pointer">進行評價</Button>
                  </Link>
                )}
                {currentUserCapabilities?.canPostProjects && isOwner && project.status !== 'OPEN' && (
                  <Link href={`/projects/${project.id}/applications`} className="w-full">
                    <Button variant="outline" className="w-full h-11 font-semibold cursor-pointer">查看申請</Button>
                  </Link>
                )}
                <ProjectSupportActions
                  projectId={project.id}
                  reportTarget={reportTarget}
                  canCreateDispute={canCreateDispute}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Info Card */}
          <Card className="border border-border/60 shadow-sm rounded-xl p-6 space-y-4 bg-card">
            <h4 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-wider">發案方資訊</h4>
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-primary text-sm font-mono flex-shrink-0">
                {project.client.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm text-foreground truncate">{project.client.name}</p>
                  <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">已實名認證企業會員</p>
              </div>
            </div>

            {/* Mock client metadata for trust-building */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground block">發案方評價</span>
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{clientStats.rating}</span>
                  <span className="text-muted-foreground font-normal">({clientStats.reviewCount})</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">專案完成率</span>
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span>{clientStats.completionRate}%</span>
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-muted-foreground block">加入時間</span>
                <span className="font-semibold text-foreground font-mono">
                  {clientStats.joinedYear} 年 (已發案過 {clientStats.reviewCount + 2} 次)
                </span>
              </div>
            </div>

            {project.references && (
              <a href={project.references} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline block pt-2 cursor-pointer border-t border-border/40 w-full">
                <ExternalLink className="h-3.5 w-3.5" />
                瀏覽參考資料
              </a>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
