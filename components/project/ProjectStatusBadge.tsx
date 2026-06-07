import { Badge } from '@/components/ui/badge';
import { ProjectStatus } from '@/types';

const variantMap: Record<ProjectStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  OPEN: 'success',
  IN_PROGRESS: 'default',
  SUBMITTED: 'warning',
  REVISION_REQUESTED: 'destructive',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  DISABLED: 'destructive',
};

const labelMap: Record<ProjectStatus, string> = {
  DRAFT: '草稿',
  OPEN: '開放申請',
  IN_PROGRESS: '進行中',
  SUBMITTED: '已提交',
  REVISION_REQUESTED: '要求修改',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  DISABLED: '已停用',
};

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}
