'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import SkillTagInput from '@/components/project/SkillTagInput';
import { updateUserSettings } from '@/actions/onboarding.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { completeOnboardingSchema } from '@/lib/validations';
import { SkillTag } from '@/types';

type SettingsFormData = z.infer<typeof completeOnboardingSchema>;

interface AccountSettingsFormProps {
  skillTags: SkillTag[];
  defaultValues: SettingsFormData;
}

export default function AccountSettingsForm({ skillTags, defaultValues }: AccountSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues.name);
  const [bio, setBio] = useState(defaultValues.bio || '');
  const [canPostProjects, setCanPostProjects] = useState(defaultValues.canPostProjects);
  const [canApplyProjects, setCanApplyProjects] = useState(defaultValues.canApplyProjects);
  const [skillTagIds, setSkillTagIds] = useState<string[]>(defaultValues.skillTagIds);

  const hasAnyCapability = canPostProjects || canApplyProjects;

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const payload: SettingsFormData = completeOnboardingSchema.parse({
          name,
          bio,
          canPostProjects,
          canApplyProjects,
          skillTagIds,
        });

        await updateUserSettings(payload);
        toast({
          title: '設定已更新',
          description: '你的能力設定、技能標籤與個人資料已同步更新。',
        });
        router.refresh();
      } catch (error) {
        toast({
          title: '更新失敗',
          description: error instanceof Error ? error.message : '請稍後再試一次。',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>基本資料</CardTitle>
          <CardDescription>這些資訊會影響你在平台上的公開呈現方式。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">名稱</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="輸入你的顯示名稱" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">個人簡介</label>
            <Textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              placeholder="簡短介紹你的背景、專長與合作方式"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>平台使用方式</CardTitle>
          <CardDescription>之後 dashboard 會依照這裡的選擇，調整優先顯示的內容。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setCanPostProjects((value) => !value)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              canPostProjects ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={canPostProjects} readOnly className="mt-1 h-4 w-4 accent-primary" />
              <div>
                <p className="font-medium text-foreground">我要發案</p>
                <p className="mt-1 text-sm text-muted-foreground">發布案件、管理申請者、驗收成果。</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCanApplyProjects((value) => !value)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              canApplyProjects ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={canApplyProjects} readOnly className="mt-1 h-4 w-4 accent-primary" />
              <div>
                <p className="font-medium text-foreground">我要接案</p>
                <p className="mt-1 text-sm text-muted-foreground">申請案件、提交成果、接收合作評價。</p>
              </div>
            </div>
          </button>

          {!hasAnyCapability && (
            <p className="text-sm text-destructive md:col-span-2">至少需要保留一種平台使用方式。</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>技能標籤</CardTitle>
          <CardDescription>調整你希望被案件和合作方搜尋到的技能。</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillTagInput
            allTags={skillTags}
            selectedTagIds={skillTagIds}
            onChange={setSkillTagIds}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSubmit} disabled={isPending || !hasAnyCapability}>
          {isPending ? '儲存中...' : '儲存設定'}
        </Button>
      </div>
    </div>
  );
}
