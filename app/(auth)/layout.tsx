import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { syncCurrentClerkUser } from '@/lib/user-sync';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }
  await syncCurrentClerkUser(userId);
  return <>{children}</>;
}
