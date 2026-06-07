'use client';

import { Megaphone } from 'lucide-react';

interface AnnouncementBannerProps {
  title: string;
}

export default function AnnouncementBanner({ title }: AnnouncementBannerProps) {
  return (
    <div className="bg-primary/5 border-b border-primary/10 py-2">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-sm">
        <Megaphone className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">{title}</span>
      </div>
    </div>
  );
}
