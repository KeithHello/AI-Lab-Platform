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
import { disableUser, enableUser, getAdminUsers } from '@/actions/admin.actions';

type UserRow = Awaited<ReturnType<typeof getAdminUsers>>['users'][number];

const statusOptions = [
  { value: 'ALL', label: '全部審核狀態' },
  { value: 'PENDING', label: '待審核' },
  { value: 'ACTIVE', label: '已通過' },
  { value: 'DISABLED', label: '已停用' },
];

const capabilityOptions = [
  { value: 'ALL', label: '全部能力' },
  { value: 'CAN_POST', label: '可發案' },
  { value: 'CAN_APPLY', label: '可接案' },
  { value: 'BOTH', label: '發案與接案' },
];

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  ACTIVE: { label: '已通過', variant: 'success' },
  PENDING: { label: '待審核', variant: 'warning' },
  DISABLED: { label: '已停用', variant: 'destructive' },
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
  return qs ? `/admin/users?${qs}` : '/admin/users';
}

export default function AdminUsersPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get('page') || '1', 10);
  const query = searchParams?.get('q') || '';
  const status = searchParams?.get('status') || 'ALL';
  const capability = searchParams?.get('capability') || 'ALL';

  const [users, setUsers] = useState<UserRow[]>([]);
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
        const result = await getAdminUsers(page, 10, {
          query,
          status: status as never,
          capability: capability as never,
        });
        setUsers(result.users);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch {
        toast({ title: '載入失敗', description: '無法載入使用者資料', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) load();
  }, [user, page, query, status, capability]);

  function updateFilters(next: Record<string, string>) {
    router.push(buildParams(new URLSearchParams(searchParams?.toString()), next));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ q: searchInput.trim() });
  }

  async function handleApprove(userId: string) {
    try {
      await enableUser({ userId });
      setUsers((prev) => prev.map((item) => (item.id === userId ? { ...item, status: 'ACTIVE' } : item)));
      toast({ title: '已通過審核', description: '使用者已可正常使用平台' });
    } catch {
      toast({ title: '操作失敗', description: '無法通過使用者審核', variant: 'destructive' });
    }
  }

  async function handleDisable(userId: string) {
    try {
      await disableUser({ userId });
      setUsers((prev) => prev.map((item) => (item.id === userId ? { ...item, status: 'DISABLED' } : item)));
      toast({ title: '已停用', description: '使用者帳號已停用' });
    } catch {
      toast({ title: '操作失敗', description: '無法停用使用者', variant: 'destructive' });
    }
  }

  if (isLoading || loading) {
    return <div className="py-10 text-center text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  const paginationParams = Object.fromEntries(
    Object.entries({ q: query, status, capability }).filter(([, value]) => value && value !== 'ALL')
  );

  const columns = [
    { key: 'name' as const, header: '姓名' },
    { key: 'email' as const, header: 'Email' },
    {
      key: 'capabilities' as const,
      header: '平台能力',
      render: (item: UserRow) => (
        <div className="flex flex-wrap gap-1">
          {item.canPostProjects && <Badge variant="secondary">發案</Badge>}
          {item.canApplyProjects && <Badge variant="secondary">接案</Badge>}
          {!item.canPostProjects && !item.canApplyProjects && <span className="text-sm text-muted-foreground">未設定</span>}
        </div>
      ),
    },
    {
      key: 'status' as const,
      header: '註冊審核',
      render: (item: UserRow) => {
        const statusInfo = statusMap[item.status] ?? statusMap.ACTIVE;
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      key: 'actions' as const,
      header: '操作',
      render: (item: UserRow) =>
        item.isAdmin ? (
          <span className="text-sm text-muted-foreground">管理員</span>
        ) : (
          <div className="flex gap-2">
            {item.status !== 'ACTIVE' && (
              <Button variant="outline" size="sm" onClick={() => handleApprove(item.id)}>
                通過
              </Button>
            )}
            {item.status !== 'DISABLED' ? (
              <Button variant="destructive" size="sm" onClick={() => handleDisable(item.id)}>
                停用
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleApprove(item.id)}>
                恢復
              </Button>
            )}
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">使用者管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          搜尋使用者，並審核註冊、角色與帳號狀態。共 {total} 筆。
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-md border bg-card p-4 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="搜尋姓名或 Email"
          />
          <Button type="submit" variant="outline">
            <Search data-icon="inline-start" />
            搜尋
          </Button>
        </form>
        <div className="grid gap-2 md:grid-cols-2">
          <Select options={statusOptions} value={status} onChange={(event) => updateFilters({ status: event.target.value })} />
          <Select options={capabilityOptions} value={capability} onChange={(event) => updateFilters({ capability: event.target.value })} />
        </div>
      </div>

      <AdminTable columns={columns} data={users} keyExtractor={(item) => item.id} />
      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/admin/users" searchParams={paginationParams} />
    </div>
  );
}
