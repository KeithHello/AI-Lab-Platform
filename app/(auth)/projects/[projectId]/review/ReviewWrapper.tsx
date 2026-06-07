'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewForm from '@/components/review/ReviewForm';
import ReviewCard from '@/components/review/ReviewCard';
import { submitReview } from '@/actions/review.actions';
import { toast } from '@/components/ui/use-toast';
import { Review } from '@/types';

interface ReviewWrapperProps {
  projectId: string;
  targetUserName: string;
  existingReview: { id: string; rating: number; comment: string | null; wouldCollaborateAgain: boolean } | null;
  allReviews: (Review & { reviewer: { name: string; avatarUrl: string | null } })[];
}

export default function ReviewWrapper({ projectId, targetUserName, existingReview, allReviews }: ReviewWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (existingReview && allReviews.length > 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">雙方評價</h2>
        {allReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">評價已提交</h2>
        <p className="text-muted-foreground">待對方完成評價後互相可見</p>
      </div>
    );
  }

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    try {
      await submitReview(data);
      toast({ title: '評價已提交' });
      router.refresh();
    } catch (error) {
      toast({ title: '提交失敗', description: error instanceof Error ? error.message : '請稍後再試', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  return (
    <ReviewForm
      projectId={projectId}
      targetUserName={targetUserName}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
