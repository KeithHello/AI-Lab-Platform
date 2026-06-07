import AdminStatCard from '@/components/admin/AdminStatCard';
import { getAdminStats } from '@/actions/admin.actions';
import { Users, Briefcase, Flag, AlertTriangle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">管理總覽</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="使用者總數"
          value={stats.totalUsers}
          icon={<Users className="h-4 w-4" />}
          description="平台所有註冊使用者"
        />
        <AdminStatCard
          title="案件總數"
          value={stats.totalProjects}
          icon={<Briefcase className="h-4 w-4" />}
          description="所有已建立案件"
        />
        <AdminStatCard
          title="待處理舉報"
          value={stats.pendingReports}
          icon={<Flag className="h-4 w-4" />}
          description="尚未處理的舉報"
        />
        <AdminStatCard
          title="未解糾紛"
          value={stats.openDisputes}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="進行中的糾紛案件"
        />
      </div>
    </div>
  );
}
