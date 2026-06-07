'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

interface AnnouncementCardProps {
  title: string;
  content: string;
  createdAt: Date;
}

export default function AnnouncementCard({ title, content, createdAt }: AnnouncementCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
        <p className="text-xs text-muted-foreground mt-3">
          {new Date(createdAt).toLocaleDateString('zh-TW')}
        </p>
      </CardContent>
    </Card>
  );
}
