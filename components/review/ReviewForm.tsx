'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { submitReviewSchema } from '@/lib/validations';
import { z } from 'zod';

type FormData = z.infer<typeof submitReviewSchema>;

interface ReviewFormProps {
  projectId: string;
  targetUserName: string;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ReviewForm({ projectId, targetUserName, onSubmit, isSubmitting }: ReviewFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(submitReviewSchema),
    defaultValues: {
      projectId,
      rating: 5,
      comment: '',
      wouldCollaborateAgain: true,
    },
  });

  const rating = watch('rating');
  const wouldCollaborateAgain = watch('wouldCollaborateAgain');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('projectId')} />

      <Card>
        <CardHeader><CardTitle>評價 {targetUserName}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">給予星級評價</p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={(v) => setValue('rating', v)} size={32} />
            </div>
            <p className="text-sm mt-2">
              {rating === 5 ? '太棒了！' : rating === 4 ? '很好' : rating === 3 ? '普通' : rating === 2 ? '待加強' : '不滿意'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">詳細評價（選填）</label>
            <Textarea {...register('comment')} placeholder="分享你的合作經驗..." rows={4} />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setValue('wouldCollaborateAgain', true)}
              className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                wouldCollaborateAgain ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
            >
              <span className="text-2xl">👍</span>
              <p className="text-sm mt-1">願意再次合作</p>
            </button>
            <button
              type="button"
              onClick={() => setValue('wouldCollaborateAgain', false)}
              className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                !wouldCollaborateAgain ? 'border-destructive bg-destructive/5' : 'border-muted'
              }`}
            >
              <span className="text-2xl">👎</span>
              <p className="text-sm mt-1">不願再合作</p>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交評價'}
        </Button>
      </div>
    </form>
  );
}
