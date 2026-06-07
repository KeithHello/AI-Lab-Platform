'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toggleBookmark } from '@/actions/bookmark.actions';
import { toast } from '@/components/ui/use-toast';

interface BookmarkButtonProps {
  projectId: string;
  initialBookmarked?: boolean;
  size?: 'sm' | 'default' | 'icon';
}

export default function BookmarkButton({ projectId, initialBookmarked = false, size = 'icon' }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        const result = await toggleBookmark(projectId);
        setBookmarked(result.bookmarked);
        toast({
          title: result.bookmarked ? '已收藏' : '已取消收藏',
          description: result.bookmarked ? '案件已加入您的收藏' : '案件已從收藏中移除',
        });
      } catch {
        toast({
          title: '操作失敗',
          description: '請先登入後再收藏案件',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className="h-8 w-8 p-0 hover:bg-red-50"
      aria-label={bookmarked ? '取消收藏' : '收藏案件'}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          bookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        }`}
      />
    </Button>
  );
}
