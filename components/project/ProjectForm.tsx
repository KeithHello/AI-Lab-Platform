'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import BudgetInput from './BudgetInput';
import SkillTagInput from './SkillTagInput';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { createProjectSchema } from '@/lib/validations';
import { Category, SkillTag } from '@/types';
import { saveProjectReviewDraft } from '@/lib/project-review-draft';

export type ProjectFormData = z.infer<typeof createProjectSchema>;

interface ProjectFormProps {
  categories: Category[];
  skillTags: SkillTag[];
  defaultValues?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onAiSuggestSkillTags?: (data: Partial<ProjectFormData>) => Promise<string[]>;
  isSubmitting?: boolean;
  reviewBackHref: string;
}

export default function ProjectForm({
  categories,
  skillTags,
  defaultValues,
  onSubmit,
  onAiSuggestSkillTags,
  isSubmitting,
  reviewBackHref,
}: ProjectFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      background: '',
      description: '',
      deliverables: '',
      acceptanceCriteria: '',
      budget: 0,
      currency: 'TWD',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      skillTagIds: [],
      confidentialityRequired: false,
      references: '',
      saveAsDraft: false,
      ...defaultValues,
    },
  });

  const selectedCategoryId = watch('categoryId');
  const budget = watch('budget');
  const currency = watch('currency');
  const skillTagIds = watch('skillTagIds');

  const currentProjectContent = () => {
    const formData = watch();
    return {
      title: formData.title,
      background: formData.background,
      description: formData.description,
      deliverables: formData.deliverables,
      acceptanceCriteria: formData.acceptanceCriteria,
    };
  };

  const handleEnterReview = async () => {
    const fields: Array<keyof ProjectFormData> = [
      'title',
      'categoryId',
      'background',
      'description',
      'deliverables',
      'acceptanceCriteria',
    ];
    const valid = await trigger(fields);
    if (!valid) return;

    saveProjectReviewDraft({
      source: reviewBackHref.includes('/edit') ? 'edit' : 'new',
      backHref: reviewBackHref,
      values: watch(),
    });

    router.push('/projects/ai-review');
  };

  const handleAutoSelectSkillTags = async () => {
    if (!onAiSuggestSkillTags) return [];
    return onAiSuggestSkillTags(currentProjectContent());
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20 py-4">
          <CardTitle className="text-base font-bold">案件基本資料</CardTitle>
          <CardDescription>先把案件的標題和分類定下來，方便後續審核與技能推薦。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">案件標題</label>
            <Input {...register('title')} placeholder="例如：React 電商網站開發" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">案件分類</label>
            <Select
              {...register('categoryId')}
              value={selectedCategoryId}
              onChange={(event) => setValue('categoryId', event.target.value)}
              options={[{ value: '', label: '請選擇分類' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
            />
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20 py-4">
          <CardTitle className="text-base font-bold">案件詳情</CardTitle>
          <CardDescription>這些內容會被 AI 讀取，也會成為後續合作的主要依據。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">案件背景</label>
            <p className="text-xs text-muted-foreground">描述此案件的背景脈絡與目的</p>
            <Textarea {...register('background')} placeholder="描述案件的背景與目的" rows={4} />
            {errors.background && <p className="text-xs text-destructive">{errors.background.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">案件敘述</label>
            <p className="text-xs text-muted-foreground">詳細說明案件的工作內容與範圍</p>
            <Textarea {...register('description')} placeholder="詳細描述案件內容" rows={6} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">交付成果</label>
            <Textarea {...register('deliverables')} placeholder="列出預期的交付成果，每項一行" rows={4} />
            {errors.deliverables && <p className="text-xs text-destructive">{errors.deliverables.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">驗收標準</label>
            <Textarea {...register('acceptanceCriteria')} placeholder="列出驗收標準與條件，每項一行" rows={4} />
            {errors.acceptanceCriteria && <p className="text-xs text-destructive">{errors.acceptanceCriteria.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/10 py-4">
          <Button type="button" variant="outline" onClick={handleEnterReview} disabled={isSubmitting}>
            <Sparkles data-icon="inline-start" />
            進入 AI 輔助審核
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20 py-4">
          <CardTitle className="text-base font-bold">預算與時程</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">預算</label>
            <BudgetInput
              amount={budget}
              currency={currency}
              onAmountChange={(value) => setValue('budget', value)}
              onCurrencyChange={(value) => setValue('currency', value)}
            />
            {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">截止日期</label>
            <Input type="date" {...register('deadline')} className="w-48" />
            {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message as string}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20 py-4">
          <CardTitle className="text-base font-bold">技能標籤</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <SkillTagInput
            allTags={skillTags}
            selectedTagIds={skillTagIds}
            categoryId={selectedCategoryId}
            onChange={(ids) => setValue('skillTagIds', ids, { shouldValidate: true, shouldDirty: true })}
            onAutoSelect={onAiSuggestSkillTags ? handleAutoSelectSkillTags : undefined}
          />
          {errors.skillTagIds && <p className="mt-2 text-xs text-destructive">{errors.skillTagIds.message}</p>}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20 py-4">
          <CardTitle className="text-base font-bold">其他設定</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" {...register('confidentialityRequired')} className="h-4 w-4 accent-primary" />
            <span className="text-sm font-medium text-foreground">需要接案方簽署保密協議 NDA</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">參考資料連結</label>
            <Input {...register('references')} placeholder="提供相關參考連結，可選" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8 pt-4">
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setValue('saveAsDraft', true)}
        >
          儲存草稿
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6"
          onClick={() => setValue('saveAsDraft', false)}
        >
          {isSubmitting ? '發布中...' : '發布案件'}
        </Button>
      </div>
    </form>
  );
}
