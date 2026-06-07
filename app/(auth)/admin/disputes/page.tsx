'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AdminTable from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { getDisputes } from '@/actions/dispute.actions';

type DisputeRow = {
  id: string;
  type: string;
  description: string;
  status: string;
  resolution: string | null;
  project: { id: string; title: string };
  reporter: { id: string; name: string; email: string };
  respondent: { id: string; name: string; email: string };
  createdAt: Date;
};

export default function AdminDisputesPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDisputes();
        setDisputes(data);
      } catch {
        toast({ title: '載入失敗', description: '無法載入糾紛資料', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    if (user?.isAdmin) load();
  }, [user]);

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    OPEN: { label: '開放中', variant: 'destructive' },
    UNDER_REVIEW: { label: '處理中', variant: 'default' },
    RESOLVED: { label: '已解決', variant: 'outline' },
  };

  const typeMap: Record<string, string> = {
    PAYMENT_ISSUE: '付款問題',
    DELIVERY_QUALITY: '交付品質',
    SCOPE_CHANGE: '範圍變更',
    OTHER: '其他',
  };

  if (isLoading || loading) {
    return <div className="text-center py-10 text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  const columns = [
    {
      key: 'project' as const,
      header: '相關案件',
      render: (item: DisputeRow) => item.project?.title ?? '-',
    },
    {
      key: 'reporter' as const,
      header: '申訴人',
      render: (item: DisputeRow) => item.reporter?.name ?? '-',
    },
    {
      key: 'respondent' as const,
      header: '被申訴人',
      render: (item: DisputeRow) => item.respondent?.name ?? '-',
    },
    {
      key: 'type' as const,
      header: '類型',
      render: (item: DisputeRow) => typeMap[item.type] ?? item.type,
    },
    {
      key: 'description' as const,
      header: '描述',
      render: (item: DisputeRow) => (
        <span className="max-w-xs truncate block" title={item.description}>
          {item.description.length > 40 ? item.description.slice(0, 40) + '...' : item.description}
        </span>
      ),
    },
    {
      key: 'status' as const,
      header: '狀態',
      render: (item: DisputeRow) => {
        const s = statusMap[item.status] ?? { label: item.status, variant: 'secondary' as const };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'resolution' as const,
      header: '解決方案',
      render: (item: DisputeRow) => item.resolution ?? '-',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">糾紛記錄</h1>
      <AdminTable columns={columns} data={disputes} keyExtractor={(item) => item.id} />
    </div>
  );
}
