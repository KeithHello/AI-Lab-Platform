'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AdminTable from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { adminDisableProject, approveProject, getAdminProjects, rejectProject } from '@/actions/admin.actions';

type ProjectRow = Awaited<ReturnType<typeof getAdminProjects>>['projects'][number];

const approvalOptions = [
  { value: 'ALL', label: '全部審核狀態' },
  { value: 'PENDING', label: '待審核' },
  { value: 'APPROVED', label: '已通過' },
];

const statusOptions = [
  { value: 'ALL', label: '全部案件狀態' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'OPEN', label: '公開中' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'SUBMITTED', label: '已提交' },
  { value: 'REVISION_REQUESTED', label: '修改中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'DISABLED', label: '已停用' },
];

const statusMap: Record<string, string> = {
  DRAFT: '草稿',
  OPEN: '公開中',
  IN_PROGRESS: '進行中',
  SUBMITTED: '已提交',
  REVISION_REQUESTED: '修改中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  DISABLED: '已停用',
};

function buildParams(params: URLSearchParams, next: Record<string, string>) {
  const updated = new URLSearchParams(params.toString());

  Object.entries(next).forEach(([key, value]) => {
    if (!value || value === 'ALL') {
      updated.delete(key);
    } else {
      updated.set(key, value);
    }
  });
  updated.delete('page');

  const qs = updated.toString();
  return qs ? `/admin/projects?${qs}` : '/admin/projects';
}

export default function AdminProjectsPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get('page') || '1', 10);
  const query = searchParams?.get('q') || '';
  const approval = searchParams?.get('approval') || 'ALL';
  const status = searchParams?.get('status') || 'ALL';

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await getAdminProjects(page, 10, {
          query,
          approval: approval as never,
          status: status as never,
        });
        setProjects(result.projects);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch {
        toast({ title: '載入失敗', description: '無法載入案件資料', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) load();
  }, [user, page, query, approval, status]);

  function updateFilters(next: Record<string, string>) {
    router.push(buildParams(new URLSearchParams(searchParams?.toString()), next));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ q: searchInput.trim() });
  }

  async function handleDisable(projectId: string) {
    try {
      await adminDisableProject({ projectId });
      setProjects((prev) => prev.map((item) => (item.id === projectId ? { ...item, status: 'DISABLED' } : item)));
      toast({ title: '已停用', description: '案件已停用' });
    } catch {
      toast({ title: '操作失敗', description: '無法停用案件', variant: 'destructive' });
    }
  }

  async function handleApprove(projectId: string) {
    try {
      await approveProject(projectId);
      setProjects((prev) => prev.map((item) => (item.id === projectId ? { ...item, isApproved: true } : item)));
      toast({ title: '已審核通過', description: '案件已通過審核' });
    } catch {
      toast({ title: '操作失敗', description: '無法通過審核', variant: 'destructive' });
    }
  }

  async function handleReject(projectId: string) {
    try {
      await rejectProject(projectId);
      setProjects((prev) =>
        prev.map((item) => (item.id === projectId ? { ...item, isApproved: false, status: 'DRAFT' } : item))
      );
      toast({ title: '已退回', description: '案件已退回草稿' });
    } catch {
      toast({ title: '操作失敗', description: '無法退回案件', variant: 'destructive' });
    }
  }

  if (isLoading || loading) {
    return <div className="py-10 text-center text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  const paginationParams = Object.fromEntries(
    Object.entries({ q: query, approval, status }).filter(([, value]) => value && value !== 'ALL')
  );

  const columns = [
    { key: 'title' as const, header: '案件標題' },
    {
      key: 'category' as const,
      header: '分類',
      render: (item: ProjectRow) => item.category?.name ?? '-',
    },
    {
      key: 'client' as const,
      header: '發案方',
      render: (item: ProjectRow) => item.client?.name ?? item.client?.email ?? '-',
    },
    {
      key: 'status' as const,
      header: '案件狀態',
      render: (item: ProjectRow) => <Badge variant="secondary">{statusMap[item.status] ?? item.status}</Badge>,
    },
    {
      key: 'isApproved' as const,
      header: '發布審核',
      render: (item: ProjectRow) =>
        item.isApproved ? <Badge variant="success">已通過</Badge> : <Badge variant="warning">待審核</Badge>,
    },
    {
      key: 'actions' as const,
      header: '操作',
      render: (item: ProjectRow) => (
        <div className="flex gap-2">
          {!item.isApproved && (
            <Button variant="outline" size="sm" onClick={() => handleApprove(item.id)}>
              通過
            </Button>
          )}
          {!item.isApproved && item.status !== 'DISABLED' && (
            <Button variant="secondary" size="sm" onClick={() => handleReject(item.id)}>
              退回
            </Button>
          )}
          {item.status !== 'DISABLED' ? (
            <Button variant="destructive" size="sm" onClick={() => handleDisable(item.id)}>
              停用
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">已停用</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">案件管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          搜尋案件，並審核案件發布與案件狀態。共 {total} 筆。
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-md border bg-card p-4 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="搜尋標題、描述、發案方"
          />
          <Button type="submit" variant="outline">
            <Search data-icon="inline-start" />
            搜尋
          </Button>
        </form>
        <div className="grid gap-2 md:grid-cols-2">
          <Select options={approvalOptions} value={approval} onChange={(event) => updateFilters({ approval: event.target.value })} />
          <Select options={statusOptions} value={status} onChange={(event) => updateFilters({ status: event.target.value })} />
        </div>
      </div>

      <AdminTable columns={columns} data={projects} keyExtractor={(item) => item.id} />
      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/admin/projects" searchParams={paginationParams} />
    </div>
  );
}
