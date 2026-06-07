'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">發生錯誤</h2>
        <p className="text-muted-foreground">{error.message || '請稍後再試'}</p>
        <Button onClick={reset}>重新整理</Button>
      </div>
    </div>
  );
}
