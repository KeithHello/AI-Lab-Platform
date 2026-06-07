'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AdminTable from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  createSkillTag,
  deleteSkillTag,
  getSkillTags,
  updateSkillTag,
} from '@/actions/skill-tag.actions';

type SkillTagRow = {
  id: string;
  name: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string } | null;
};

export default function AdminSkillTagsPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [skillTags, setSkillTags] = useState<SkillTagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSkillTags();
        setSkillTags(data);
      } catch {
        toast({ title: '載入失敗', description: '無法載入技能標籤資料', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) load();
  }, [user]);

  function resetForm() {
    setFormName('');
    setFormCategoryId('');
    setShowCreate(false);
    setEditId(null);
  }

  function startEdit(item: SkillTagRow) {
    setEditId(item.id);
    setFormName(item.name);
    setFormCategoryId(item.categoryId ?? '');
    setShowCreate(true);
  }

  async function handleSubmit() {
    if (!formName.trim()) {
      toast({ title: '請輸入標籤名稱', variant: 'destructive' });
      return;
    }

    try {
      if (editId) {
        await updateSkillTag({
          skillTagId: editId,
          name: formName,
          categoryId: formCategoryId || undefined,
        });
        toast({ title: '已更新', description: '技能標籤已更新' });
      } else {
        await createSkillTag({ name: formName, categoryId: formCategoryId || undefined });
        toast({ title: '已建立', description: '技能標籤已建立' });
      }

      const data = await getSkillTags();
      setSkillTags(data);
      resetForm();
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  }

  async function handleToggleActive(item: SkillTagRow) {
    try {
      await updateSkillTag({ skillTagId: item.id, isActive: !item.isActive });
      setSkillTags((prev) =>
        prev.map((tag) => (tag.id === item.id ? { ...tag, isActive: !item.isActive } : tag))
      );
      toast({ title: item.isActive ? '已停用' : '已啟用' });
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSkillTag({ skillTagId: id });
      setSkillTags((prev) => prev.filter((tag) => tag.id !== id));
      toast({ title: '已刪除', description: '技能標籤已刪除' });
    } catch {
      toast({ title: '刪除失敗', description: '無法刪除技能標籤', variant: 'destructive' });
    }
  }

  if (isLoading || loading) {
    return <div className="py-10 text-center text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSkillTags = skillTags.filter((item) => {
    if (!normalizedQuery) return true;
    return [item.name, item.category?.name ?? ''].join(' ').toLowerCase().includes(normalizedQuery);
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">技能標籤管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            搜尋、建立與管理可供使用者和案件選擇的技能標籤。共 {filteredSkillTags.length} 筆。
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus data-icon="inline-start" />
          新增標籤
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-md border bg-card p-4">
        <Search className="text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋標籤名稱或分類"
        />
      </div>

      {showCreate && (
        <div className="flex flex-col gap-3 rounded-md border bg-card p-4">
          <h3 className="font-semibold">{editId ? '編輯標籤' : '新增標籤'}</h3>
          <Input
            placeholder="標籤名稱"
            value={formName}
            onChange={(event) => setFormName(event.target.value)}
          />
          <Input
            placeholder="分類 ID，可留空"
            value={formCategoryId}
            onChange={(event) => setFormCategoryId(event.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit}>
              <Check data-icon="inline-start" />
              {editId ? '更新' : '建立'}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm}>
              <X data-icon="inline-start" />
              取消
            </Button>
          </div>
        </div>
      )}

      <AdminTable
        columns={[
          { key: 'name' as const, header: '標籤名稱' },
          {
            key: 'category' as const,
            header: '所屬分類',
            render: (item) => item.category?.name ?? '-',
          },
          {
            key: 'isActive' as const,
            header: '狀態',
            render: (item) => (
              <button type="button" onClick={() => handleToggleActive(item)}>
                <Badge variant={item.isActive ? 'success' : 'destructive'}>
                  {item.isActive ? '啟用' : '停用'}
                </Badge>
              </button>
            ),
          },
          {
            key: 'actions' as const,
            header: '操作',
            render: (item) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 />
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredSkillTags}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
