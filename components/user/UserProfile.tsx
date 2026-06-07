'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar, Star, ThumbsUp } from 'lucide-react';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    role: string;
    canPostProjects: boolean;
    canApplyProjects: boolean;
    createdAt: Date;
    skills: { id: string; name: string }[];
  };
  stats: {
    completedProjects: number;
    averageRating: number;
    totalReviews: number;
    collaborateAgainRate: number;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    wouldCollaborateAgain: boolean;
    createdAt: Date;
    reviewer: { name: string; avatarUrl: string | null };
    project: { title: string };
  }[];
}

export default function UserProfile({ user, stats, reviews }: UserProfileProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.canPostProjects && <Badge variant="secondary">發案</Badge>}
                {user.canApplyProjects && <Badge variant="secondary">接案</Badge>}
              </div>
              {user.bio && <p className="mt-3 text-muted-foreground">{user.bio}</p>}
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>加入於 {new Date(user.createdAt).toLocaleDateString('zh-TW')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Briefcase className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <div className="text-xs text-muted-foreground">完成案件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Star className="mx-auto mb-1 h-5 w-5 text-yellow-500" />
            <div className="text-2xl font-bold">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}</div>
            <div className="text-xs text-muted-foreground">平均評分</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Star className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <div className="text-xs text-muted-foreground">收到評價</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <ThumbsUp className="mx-auto mb-1 h-5 w-5 text-green-500" />
            <div className="text-2xl font-bold">
              {stats.totalReviews > 0 ? `${Math.round(stats.collaborateAgainRate)}%` : '-'}
            </div>
            <div className="text-xs text-muted-foreground">願意再合作</div>
          </CardContent>
        </Card>
      </div>

      {user.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">技能標籤</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">{skill.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">評價紀錄</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">尚無公開評價紀錄。</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.reviewer.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">{review.reviewer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">{review.reviewer.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{review.project.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`h-3.5 w-3.5 ${
                            index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="ml-10 mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                  <div className="ml-10 mt-1 flex items-center gap-2">
                    {review.wouldCollaborateAgain && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        <ThumbsUp className="mr-1 h-3 w-3" />
                        願意再次合作
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
