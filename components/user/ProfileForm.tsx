'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SkillTagInput from '@/components/project/SkillTagInput';
import { completeOnboardingSchema } from '@/lib/validations';
import { SkillTag } from '@/types';

type FormData = z.infer<typeof completeOnboardingSchema>;

interface ProfileFormProps {
  skillTags: SkillTag[];
  defaultValues?: Partial<FormData>;
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ProfileForm({
  skillTags,
  defaultValues,
  currentStep,
  onStepChange,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(completeOnboardingSchema),
    defaultValues: {
      name: '',
      bio: '',
      canPostProjects: true,
      canApplyProjects: true,
      skillTagIds: [],
      ...defaultValues,
    },
  });

  const selectedSkillIds = watch('skillTagIds');
  const canPostProjects = watch('canPostProjects');
  const canApplyProjects = watch('canApplyProjects');
  const hasAnyCapability = canPostProjects || canApplyProjects;

  const goNext = async () => {
    const fieldsByStep: Array<Array<keyof FormData>> = [
      ['name', 'bio'],
      ['skillTagIds'],
      ['canPostProjects', 'canApplyProjects'],
    ];
    const valid = await trigger(fieldsByStep[currentStep]);
    if (valid) {
      onStepChange(Math.min(currentStep + 1, 2));
    }
  };

  function toggleCapability(field: 'canPostProjects' | 'canApplyProjects', value: boolean) {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {currentStep === 0 && (
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>基本資料</CardTitle>
            <CardDescription>先補齊公開顯示的名稱與個人介紹。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">名稱</label>
              <Input {...register('name')} placeholder="輸入你的顯示名稱" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">個人簡介</label>
              <Textarea
                {...register('bio')}
                placeholder="簡短介紹你的背景、專長與合作方式"
                rows={4}
              />
              {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>技能標籤</CardTitle>
            <CardDescription>選擇你想讓案件與合作方更容易找到你的能力。</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillTagInput
              allTags={skillTags}
              selectedTagIds={selectedSkillIds}
              onChange={(tagIds) => setValue('skillTagIds', tagIds, { shouldValidate: true, shouldDirty: true })}
              disabled={isSubmitting}
            />
            {errors.skillTagIds && <p className="mt-3 text-sm text-destructive">{errors.skillTagIds.message}</p>}
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>平台使用方式</CardTitle>
            <CardDescription>這個設定之後也可以到站內設定頁修改。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <button
              type="button"
              onClick={() => toggleCapability('canPostProjects', !canPostProjects)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                canPostProjects ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={canPostProjects} readOnly className="mt-1 h-4 w-4 accent-primary" />
                <div>
                  <p className="font-medium text-foreground">我要發案</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    可以發布案件、管理申請者、驗收交付成果。
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleCapability('canApplyProjects', !canApplyProjects)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                canApplyProjects ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={canApplyProjects} readOnly className="mt-1 h-4 w-4 accent-primary" />
                <div>
                  <p className="font-medium text-foreground">我要接案</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    可以申請案件、提交成果、接受合作評價。
                  </p>
                </div>
              </div>
            </button>

            {!hasAnyCapability && (
              <p className="text-sm text-destructive">至少需要選擇一種平台使用方式。</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={currentStep === 0 || isSubmitting}
          onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
        >
          上一步
        </Button>
        {currentStep < 2 ? (
          <Button type="button" onClick={goNext}>
            下一步
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting || !hasAnyCapability}>
            {isSubmitting ? '設定中...' : '完成設定'}
          </Button>
        )}
      </div>
    </form>
  );
}
