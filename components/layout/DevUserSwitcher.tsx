'use client';

import { useEffect, useState, useTransition } from 'react';
import { ShieldAlert } from 'lucide-react';
import { clearDevUser, getDevUsers, switchDevUser } from '@/actions/dev.actions';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface DevUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  canPostProjects: boolean;
  canApplyProjects: boolean;
  isAdmin: boolean;
}

export default function DevUserSwitcher() {
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<DevUser[]>([]);
  const { toast } = useToast();
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev) return;
    async function loadUsers() {
      const devUsers = await getDevUsers();
      setUsers(devUsers as DevUser[]);
    }
    loadUsers();
  }, [isDev]);

  if (!isDev || users.length === 0) {
    return null;
  }

  const handleSwitch = (userId: string) => {
    startTransition(async () => {
      try {
        const result = userId ? await switchDevUser(userId) : await clearDevUser();
        if (result.success) {
          toast({
            title: userId ? '已切換測試帳號' : '已恢復目前登入帳號',
            description: '正在重新載入頁面...',
          });
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        toast({
          title: '切換失敗',
          description: error instanceof Error ? error.message : '切換測試帳號失敗',
          variant: 'destructive',
        });
      }
    });
  };

  const getCapabilityText = (user: DevUser) => {
    if (user.isAdmin) return '管理員';
    if (user.canPostProjects && user.canApplyProjects) return '發案/接案';
    if (user.canPostProjects) return '發案';
    if (user.canApplyProjects) return '接案';
    return '未設定';
  };

  const options = [
    { value: '', label: '使用目前登入帳號' },
    ...users.map((user) => ({
      value: user.id,
      label: `[${getCapabilityText(user)}] ${user.name}`,
    })),
  ];

  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200/60 bg-red-50/80 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm backdrop-blur-sm">
      <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500" />
      <span className="hidden font-mono lg:inline">DEV MODE:</span>
      <Select
        value=""
        onChange={(event) => handleSwitch(event.target.value)}
        options={options}
        className="h-8 w-48 border-red-200/50 bg-white/95 py-0.5 text-xs font-medium text-red-900 focus-visible:ring-red-400"
        disabled={isPending}
      />
    </div>
  );
}
