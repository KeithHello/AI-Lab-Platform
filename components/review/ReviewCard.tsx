'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review & { reviewer: { name: string; avatarUrl: string | null } };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{review.reviewer.name}</CardTitle>
          <StarRating value={review.rating} readonly size={16} />
        </div>
      </CardHeader>
      <CardContent>
        {review.comment && (
          <p className="text-sm text-muted-foreground">{review.comment}</p>
        )}
        <div className="mt-3">
          <span className={`text-sm ${review.wouldCollaborateAgain ? 'text-green-600' : 'text-red-600'}`}>
            {review.wouldCollaborateAgain ? '👍 願意再次合作' : '👎 不願再合作'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
