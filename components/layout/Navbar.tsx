'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Menu, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import DevUserSwitcher from './DevUserSwitcher';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const { user: dbUser } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canPostProjects = !!dbUser?.canPostProjects;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary transition-opacity hover:opacity-90">
              AI Lab Platform
            </Link>
            <div className="ml-10 hidden gap-2 md:flex">
              <Link href="/projects" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                案件列表
              </Link>
              {isSignedIn && (
                <>
                  <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    儀表板
                  </Link>
                  {canPostProjects && (
                    <Link href="/projects/new" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      發布案件
                    </Link>
                  )}
                  <Link href="/settings" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    設定
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DevUserSwitcher />
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <span className="hidden text-sm font-medium text-muted-foreground md:block">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">登入</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">註冊</Button>
                </SignInButton>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="flex flex-col gap-1 border-t py-3 md:hidden">
            <Link href="/projects" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
              案件列表
            </Link>
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                  儀表板
                </Link>
                {canPostProjects && (
                  <Link href="/projects/new" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                    發布案件
                  </Link>
                )}
                <Link href="/settings" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                  <span className="inline-flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    設定
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3 py-2">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full">登入</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full">註冊</Button>
                </SignInButton>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
