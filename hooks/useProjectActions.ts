'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

export function useProjectActions() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const wrapAction = async <T,>(fn: () => Promise<T>, successMessage?: string) => {
    setIsLoading(true);
    try {
      const result = await fn();
      if (successMessage) {
        toast({ title: successMessage });
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失敗';
      toast({ title: '錯誤', description: message, variant: 'destructive' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, wrapAction, router };
}
