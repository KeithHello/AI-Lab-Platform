'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useFilterParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const budgetMin = searchParams.get('budgetMin') || '';
  const budgetMax = searchParams.get('budgetMax') || '';
  const deadlineFrom = searchParams.get('deadlineFrom') || '';
  const deadlineTo = searchParams.get('deadlineTo') || '';
  const sortBy = searchParams.get('sortBy') || '';

  const setParams = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          current.set(key, value);
        } else {
          current.delete(key);
        }
      });
      // Reset page when filters change
      if (!('page' in params)) {
        current.delete('page');
      }
      router.push(`${pathname}?${current.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return {
    search,
    categoryId,
    status,
    page,
    budgetMin,
    budgetMax,
    deadlineFrom,
    deadlineTo,
    sortBy,
    setParams,
  };
}
