'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface AIReviewButtonProps {
  onReview: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function AIReviewButton({ onReview, isLoading, disabled }: AIReviewButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onReview}
      disabled={disabled || isLoading}
      className="gap-2"
    >
      <Sparkles data-icon="inline-start" />
      {isLoading ? 'AI 審核中...' : 'AI 輔助審核'}
    </Button>
  );
}
