'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  /** Extra search params to preserve */
  searchParams?: Record<string, string>;
}

function buildUrl(baseUrl: string, page: number, searchParams?: Record<string, string>) {
  const params = new URLSearchParams(searchParams || {});
  if (page > 1) {
    params.set('page', String(page));
  } else {
    params.delete('page');
  }
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="分頁導覽">
      <Link
        href={buildUrl(baseUrl, currentPage - 1, searchParams)}
        aria-disabled={currentPage <= 1}
        className={currentPage <= 1 ? 'pointer-events-none' : ''}
      >
        <Button variant="outline" size="icon" disabled={currentPage <= 1} className="h-9 w-9">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>
        ) : (
          <Link key={page} href={buildUrl(baseUrl, page, searchParams)}>
            <Button
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              className="h-9 w-9 p-0"
            >
              {page}
            </Button>
          </Link>
        )
      )}

      <Link
        href={buildUrl(baseUrl, currentPage + 1, searchParams)}
        aria-disabled={currentPage >= totalPages}
        className={currentPage >= totalPages ? 'pointer-events-none' : ''}
      >
        <Button variant="outline" size="icon" disabled={currentPage >= totalPages} className="h-9 w-9">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </nav>
  );
}
