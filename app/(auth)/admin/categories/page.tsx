'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/actions/category.actions';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminCategoriesPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState(0);

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        toast({ title: '載入失敗', description: '無法載入分類資料', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    if (user?.isAdmin) load();
  }, [user]);

  function resetForm() {
    setFormName('');
    setFormDesc('');
    setFormOrder(0);
    setShowCreate(false);
    setEditId(null);
  }

  function startEdit(item: CategoryRow) {
    setEditId(item.id);
    setFormName(item.name);
    setFormDesc(item.description ?? '');
    setFormOrder(item.sortOrder);
    setShowCreate(true);
  }

  async function handleSubmit() {
    if (!formName.trim()) {
      toast({ title: '請輸入分類名稱', variant: 'destructive' });
      return;
    }

    try {
      if (editId) {
        await updateCategory({ categoryId: editId, name: formName, description: formDesc || null, sortOrder: formOrder });
        toast({ title: '已更新', description: '分類已更新' });
      } else {
        await createCategory({ name: formName, description: formDesc || undefined, sortOrder: formOrder });
        toast({ title: '已建立', description: '分類已建立' });
      }
      const data = await getCategories();
      setCategories(data);
      resetForm();
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  }

  async function handleToggleActive(item: CategoryRow) {
    try {
      await updateCategory({ categoryId: item.id, isActive: !item.isActive });
      setCategories((prev) => prev.map((c) => (c.id === item.id ? { ...c, isActive: !item.isActive } : c)));
      toast({ title: item.isActive ? '已停用' : '已啟用' });
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory({ categoryId: id });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: '已刪除', description: '分類已刪除' });
    } catch {
      toast({ title: '刪除失敗', description: '無法刪除分類', variant: 'destructive' });
    }
  }

  if (isLoading || loading) {
    return <div className="text-center py-10 text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分類管理</h1>
        <Button onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="h-4 w-4 mr-1" /> 新增分類
        </Button>
      </div>

      {showCreate && (
        <div className="border rounded-lg p-4 mb-6 bg-card space-y-3">
          <h3 className="font-semibold">{editId ? '編輯分類' : '新增分類'}</h3>
          <Input
            placeholder="分類名稱"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Input
            placeholder="描述 (選填)"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />
          <Input
            type="number"
            placeholder="排序 (數字)"
            value={formOrder}
            onChange={(e) => setFormOrder(Number(e.target.value))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit}>
              <Check className="h-4 w-4 mr-1" /> {editId ? '更新' : '建立'}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" /> 取消
            </Button>
          </div>
        </div>
      )}

      <AdminTable
        columns={[
          { key: 'name' as const, header: '名稱' },
          {
            key: 'description' as const,
            header: '描述',
            render: (item) => item.description || '-',
          },
          { key: 'sortOrder' as const, header: '排序' },
          {
            key: 'isActive' as const,
            header: '狀態',
            render: (item) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(item)}
                className={item.isActive ? 'text-green-600' : 'text-red-600'}
              >
                {item.isActive ? '啟用' : '停用'}
              </Button>
            ),
          },
          {
            key: 'actions' as const,
            header: '操作',
            render: (item) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ),
          },
        ]}
        data={categories}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
