'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { getReports, handleReport } from '@/actions/report.actions';

type ReportRow = {
  id: string;
  type: string;
  description: string;
  status: string;
  resolution: string | null;
  reporter: { id: string; name: string; email: string };
  reportedUser: { id: string; name: string; email: string };
  project: { id: string; title: string } | null;
  createdAt: Date;
};

export default function AdminReportsPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getReports();
        setReports(data);
      } catch {
        toast({ title: '載入失敗', description: '無法載入舉報資料', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    if (user?.isAdmin) load();
  }, [user]);

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: '待處理', variant: 'secondary' },
    UNDER_REVIEW: { label: '處理中', variant: 'default' },
    RESOLVED: { label: '已解決', variant: 'outline' },
    DISMISSED: { label: '已駁回', variant: 'outline' },
  };

  const typeMap: Record<string, string> = {
    NON_PAYMENT: '未付款',
    POOR_QUALITY: '品質不佳',
    HARASSMENT: '騷擾行為',
    SPAM: '垃圾訊息',
    OTHER: '其他',
  };

  async function handleAction(reportId: string, status: 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED', disableUser = false) {
    try {
      await handleReport({ reportId, status, disableUser });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      const labels: Record<string, string> = { UNDER_REVIEW: '已設為處理中', RESOLVED: '已解決', DISMISSED: '已駁回' };
      toast({ title: labels[status] });
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  }

  if (isLoading || loading) {
    return <div className="text-center py-10 text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  const columns = [
    {
      key: 'reporter' as const,
      header: '舉報人',
      render: (item: ReportRow) => item.reporter?.name ?? '-',
    },
    {
      key: 'reportedUser' as const,
      header: '被舉報人',
      render: (item: ReportRow) => item.reportedUser?.name ?? '-',
    },
    {
      key: 'type' as const,
      header: '類型',
      render: (item: ReportRow) => typeMap[item.type] ?? item.type,
    },
    {
      key: 'description' as const,
      header: '描述',
      render: (item: ReportRow) => (
        <span className="max-w-xs truncate block" title={item.description}>
          {item.description.length > 40 ? item.description.slice(0, 40) + '...' : item.description}
        </span>
      ),
    },
    {
      key: 'status' as const,
      header: '狀態',
      render: (item: ReportRow) => {
        const s = statusMap[item.status] ?? { label: item.status, variant: 'secondary' as const };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'actions' as const,
      header: '操作',
      render: (item: ReportRow) => (
        <div className="flex gap-2">
          {item.status === 'PENDING' && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleAction(item.id, 'UNDER_REVIEW')}>
                處理
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleAction(item.id, 'DISMISSED')}>
                駁回
              </Button>
            </>
          )}
          {(item.status === 'PENDING' || item.status === 'UNDER_REVIEW') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction(item.id, 'RESOLVED', true)}
            >
              解決並停用
            </Button>
          )}
          {item.status === 'RESOLVED' || item.status === 'DISMISSED' ? (
            <span className="text-muted-foreground text-sm">已處理</span>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">舉報管理</h1>
      <AdminTable columns={columns} data={reports} keyExtractor={(item) => item.id} />
    </div>
  );
}
