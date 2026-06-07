'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ToggleButton from '@/components/admin/ToggleButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { getReviewSettings, updateReviewSetting } from '@/actions/review-setting.actions';

type SettingRow = {
  id: string;
  reviewType: string;
  isEnabled: boolean;
};

const settingLabels: Record<
  string,
  { title: string; description: string; reviewHref: string; reviewLabel: string }
> = {
  USER_ONBOARDING: {
    title: '使用者註冊審核',
    description: '啟用後，新使用者完成個人資料設定後會進入待審核狀態，需要管理員通過後才算完成註冊審核。',
    reviewHref: '/admin/users?status=PENDING',
    reviewLabel: '前往使用者審核',
  },
  PROJECT_PUBLISH: {
    title: '案件發布審核',
    description: '啟用後，新發布的案件會進入待審核狀態，需要管理員通過後才會公開顯示。',
    reviewHref: '/admin/projects?approval=PENDING',
    reviewLabel: '前往案件審核',
  },
};

export default function AdminSettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getReviewSettings();
        setSettings(data);
      } catch {
        toast({ title: '載入失敗', description: '無法載入審核設定', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) load();
  }, [user]);

  async function handleToggle(reviewType: string, enabled: boolean) {
    try {
      await updateReviewSetting({ reviewType, isEnabled: enabled });
      setSettings((prev) =>
        prev.map((setting) =>
          setting.reviewType === reviewType ? { ...setting, isEnabled: enabled } : setting
        )
      );
      toast({
        title: '已更新',
        description: `${settingLabels[reviewType]?.title ?? reviewType} 已${enabled ? '啟用' : '停用'}`,
      });
    } catch {
      toast({ title: '更新失敗', variant: 'destructive' });
    }
  }

  function getEnabled(reviewType: string) {
    return settings.find((setting) => setting.reviewType === reviewType)?.isEnabled ?? false;
  }

  if (isLoading || loading) {
    return <div className="py-10 text-center text-muted-foreground">載入中...</div>;
  }
  if (!user?.isAdmin) return null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">審核設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          這裡只控制是否需要審核；實際審核會在對應的管理頁進行。
        </p>
      </div>

      {Object.entries(settingLabels).map(([reviewType, { title, description, reviewHref, reviewLabel }]) => (
        <Card key={reviewType}>
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <ToggleButton
                enabled={getEnabled(reviewType)}
                onChange={(enabled) => handleToggle(reviewType, enabled)}
                label={getEnabled(reviewType) ? '已啟用' : '已停用'}
              />
              <Button variant="outline" asChild>
                <Link href={reviewHref}>
                  {reviewLabel}
                  <ExternalLink data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
