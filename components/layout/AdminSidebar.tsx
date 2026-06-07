'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderTree,
  Tags,
  Flag,
  AlertTriangle,
  Megaphone,
  Settings,
} from 'lucide-react';

const adminMenuItems = [
  { href: '/admin', label: '管理總覽', icon: LayoutDashboard },
  { href: '/admin/users', label: '使用者管理', icon: Users },
  { href: '/admin/projects', label: '案件管理', icon: Briefcase },
  { href: '/admin/categories', label: '分類管理', icon: FolderTree },
  { href: '/admin/skill-tags', label: '技能標籤', icon: Tags },
  { href: '/admin/reports', label: '舉報管理', icon: Flag },
  { href: '/admin/disputes', label: '糾紛記錄', icon: AlertTriangle },
  { href: '/admin/announcements', label: '公告管理', icon: Megaphone },
  { href: '/admin/settings', label: '審核設定', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
          管理員後台
        </h2>
      </div>
      <nav className="space-y-1">
        {adminMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
