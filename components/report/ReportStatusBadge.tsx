import { Badge } from '@/components/ui/badge';
import { ReportStatus } from '@/types';

const variantMap: Record<ReportStatus, 'warning' | 'default' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'default',
  RESOLVED: 'success',
  DISMISSED: 'destructive',
};

const labelMap: Record<ReportStatus, string> = {
  PENDING: '待處理',
  UNDER_REVIEW: '審理中',
  RESOLVED: '已解決',
  DISMISSED: '已駁回',
};

export default function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}
