import { requireAdmin } from '@/lib/permissions';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 min-h-[calc(100vh-4rem)] bg-muted/30">
        {children}
      </main>
    </div>
  );
}
