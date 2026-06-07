'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';

export default function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {user.canPostProjects && <Badge>發案</Badge>}
            {user.canApplyProjects && <Badge>接案</Badge>}
            <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING' ? 'warning' : 'destructive'}>
              {user.status === 'ACTIVE' ? '啟用' : user.status === 'PENDING' ? '待審核' : '停用'}
            </Badge>
          </div>
          {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
