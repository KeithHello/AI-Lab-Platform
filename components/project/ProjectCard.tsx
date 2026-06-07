'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectCardData, ProjectStatus } from '@/types';
import { formatCurrency, Currency } from '@/lib/currency';
import { Calendar, Users } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

const statusVariantMap: Record<ProjectStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  OPEN: 'success',
  IN_PROGRESS: 'default',
  SUBMITTED: 'warning',
  REVISION_REQUESTED: 'destructive',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  DISABLED: 'destructive',
};

const statusLabelMap: Record<ProjectStatus, string> = {
  DRAFT: '草稿',
  OPEN: '開放申請',
  IN_PROGRESS: '進行中',
  SUBMITTED: '已提交',
  REVISION_REQUESTED: '要求修改',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  DISABLED: '已停用',
};

interface ProjectCardProps {
  project: ProjectCardData;
  isBookmarked?: boolean;
  showBookmark?: boolean;
}

export default function ProjectCard({ project, isBookmarked = false, showBookmark = true }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block h-full group">
      <Card className="hover:shadow-md border border-border/60 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between bg-card overflow-hidden rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {showBookmark && (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="cursor-pointer">
                  <BookmarkButton projectId={project.id} initialBookmarked={isBookmarked} />
                </div>
              )}
              <Badge variant={statusVariantMap[project.status]} className="font-mono text-xs shadow-none">
                {statusLabelMap[project.status]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0">
          <div className="space-y-3">
            {/* Budget Display */}
            <div className="inline-flex items-center px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-100 font-mono font-bold text-sm">
              {formatCurrency(project.budget, project.currency as Currency)}
            </div>

            {/* Project Specs */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span>截止: {new Date(project.deadline).toLocaleDateString('zh-TW')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary/70" />
                <span>{project.applicationCount} 人已應徵</span>
              </div>
            </div>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.skills.slice(0, 3).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-[10px] font-mono bg-muted/65 hover:bg-muted text-muted-foreground border-none px-2 py-0.5 rounded">
                  {skill.name}
                </Badge>
              ))}
              {project.skills.length > 3 && (
                <Badge variant="secondary" className="text-[10px] font-mono bg-muted/65 text-muted-foreground border-none px-2 py-0.5 rounded">
                  +{project.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Footer of Card */}
          <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span className="font-semibold text-foreground/80">{project.category.name}</span>
            <span className="truncate max-w-[120px]">{project.clientName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

