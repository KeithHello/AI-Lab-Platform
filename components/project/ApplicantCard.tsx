'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Application, User, SkillTag } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';

interface ApplicantCardProps {
  application: Application & { freelancer: User & { skills: { skillTag: SkillTag }[] } };
  onSelect?: () => void;
  disabled?: boolean;
}

const statusConfig = {
  PENDING: { label: '審核中', variant: 'warning' as const },
  ACCEPTED: { label: '已錄取', variant: 'success' as const },
  REJECTED: { label: '已拒絕', variant: 'destructive' as const },
};

export default function ApplicantCard({ application, onSelect, disabled }: ApplicantCardProps) {
  const status = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const initials = application.freelancer.name.slice(0, 2).toUpperCase();

  return (
    <Card className="rounded-xl border border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-primary/20">
              <AvatarImage src={application.freelancer.avatarUrl || undefined} />
              <AvatarFallback className="bg-indigo-100 text-primary font-bold font-mono text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold text-foreground">{application.freelancer.name}</h3>
              <p className="text-xs text-muted-foreground">{application.freelancer.email}</p>
            </div>
          </div>
          <Badge variant={status.variant} className="font-mono text-xs shadow-none">
            {status.label}
          </Badge>
        </div>

        {/* Skills */}
        {application.freelancer.skills && application.freelancer.skills.length > 0 && (
          <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b">
            {application.freelancer.skills.map((us) => (
              <Badge key={us.skillTag.id} variant="secondary" className="text-[10px] font-mono bg-muted/65 border-none px-2 py-0.5">
                {us.skillTag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-muted-foreground">自我介紹</h4>
            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{application.description}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-muted-foreground">預計執行方式</h4>
            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{application.approach}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span>預計 <span className="font-bold font-mono text-foreground">{application.estimatedDays}</span> 天完成</span>
            </div>
            {application.portfolioUrls && (
              <span className="text-xs font-semibold text-primary">含作品集連結</span>
            )}
          </div>

          {application.status === 'PENDING' && onSelect && (
            <Button
              onClick={onSelect}
              disabled={disabled}
              className="w-full h-10 font-semibold cursor-pointer shadow-sm mt-2"
            >
              選擇此接案者
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

