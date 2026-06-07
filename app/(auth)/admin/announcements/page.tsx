'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/actions/announcement.actions';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminAnnouncementsPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch {
        toast({ title: '載入失敗', description: '無法載入公告資料', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    if (user?.isAdmin) load();
  }, [user]);

  function resetForm() {
    setFormTitle('');
    setFormContent('');
    setShowCreate(false);
    setEditId(null);
  }

  function startEdit(item: AnnouncementRow) {
    setEditId(item.id);
    setFormTitle(item.title);
    setFormContent(item.content);
    setShowCreate(true);
  }

  async function handleSubmit() {
    if (!formTitle.trim() || !formContent.trim()) {
      toast({ title: '請填寫標題和內容', variant: 'destructive' });
      return;
    }

    try {
      if (editId) {
        await updateAnnouncement({ announcementId: editId, title: formTitle, content: formContent });
        toast({ title: '已更新', description: '公告已更新' });
      } else {
        await createAnnouncement({ title: formTitle, content: formContent });
        toast({ title: '已發布', description: '公告已發布' });
      }
      const data = await getAnnouncements();
      setAnnouncements(data);
      resetForm();
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  }

  async function handleToggleActive(item: AnnouncementRow) {
    try {
      await updateAnnouncement({ announcementId: item.id, isActive: !item.isActive });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isActive: !item.isActive } : a))
      );
      toast({ title: item.isActive ? '已下架' : '已上架' });
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAnnouncement({ announcementId: id });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast({ title: '已刪除', description: '公告已刪除' });
    } catch {
      toast({ title: '刪除失敗', description: '無法刪除公告', variant: 'destructive' });
    }
  }

  if (isLoading || loading) {
    return <div className="text-center py-10 text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">公告管理</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> 發布公告
        </Button>
      </div>

      {showCreate && (
        <div className="border rounded-lg p-4 mb-6 bg-card space-y-3">
          <h3 className="font-semibold">{editId ? '編輯公告' : '發布新公告'}</h3>
          <Input
            placeholder="公告標題"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
          <textarea
            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="公告內容"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit}>
              <Check className="h-4 w-4 mr-1" /> {editId ? '更新' : '發布'}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" /> 取消
            </Button>
          </div>
        </div>
      )}

      <AdminTable
        columns={[
          { key: 'title' as const, header: '標題' },
          {
            key: 'content' as const,
            header: '內容',
            render: (item) => (
              <span className="max-w-xs truncate block" title={item.content}>
                {item.content.length > 50 ? item.content.slice(0, 50) + '...' : item.content}
              </span>
            ),
          },
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
                {item.isActive ? '上架中' : '已下架'}
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
        data={announcements}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
