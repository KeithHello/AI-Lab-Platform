import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { zhTW } from '@clerk/localizations';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Lab Platform - 專業接案平台',
  description: '連接發案方與接案者的專業平台。安全、透明、高效的合作體驗。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      localization={zhTW as any}
      appearance={{
        variables: {
          colorPrimary: '#6366F1',
          colorTextSecondary: '#64748B',
          borderRadius: '0.75rem',
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
        },
        elements: {
          card: 'shadow-md border border-border/80 rounded-xl',
          headerTitle: 'text-xl font-bold tracking-tight text-foreground',
          headerSubtitle: 'text-xs text-muted-foreground',
        }
      }}
    >
      <html lang="zh-TW">
        <body className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
