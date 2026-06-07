'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@/types';

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const pathname = usePathname();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!clerkLoaded) return;

      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        } else {
          setDbUser(null);
        }
      } catch {
        setDbUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [clerkLoaded, pathname]);

  return {
    user: dbUser,
    clerkUser,
    isLoading: !clerkLoaded || isLoading,
    isSignedIn: !!clerkUser || !!dbUser,
  };
}
