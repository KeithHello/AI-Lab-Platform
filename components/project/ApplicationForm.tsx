'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicUrlList from './DynamicUrlList';
import { applyProjectSchema } from '@/lib/validations';
import { z } from 'zod';

type FormData = z.infer<typeof applyProjectSchema>;

interface ApplicationFormProps {
  projectId: string;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ApplicationForm({ projectId, onSubmit, isSubmitting }: ApplicationFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(applyProjectSchema),
    defaultValues: {
      projectId,
      description: '',
      approach: '',
      estimatedDays: 7,
      portfolioUrls: [] as string[],
    },
  });

  const portfolioUrls = watch('portfolioUrls');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('projectId')} />

      <Card>
        <CardHeader><CardTitle>申請說明</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">自我介紹 / 為何適合此案件</label>
            <Textarea {...register('description')} placeholder="簡述你的背景與為何適合這個案件" rows={4} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">預計執行方式</label>
            <Textarea {...register('approach')} placeholder="描述你預計如何執行此案件" rows={4} />
            {errors.approach && <p className="text-sm text-destructive mt-1">{errors.approach.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">預計完成天數</label>
            <Input type="number" {...register('estimatedDays', { valueAsNumber: true })} min={1} />
            {errors.estimatedDays && <p className="text-sm text-destructive mt-1">{errors.estimatedDays.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>作品集 / 相關連結</CardTitle></CardHeader>
        <CardContent>
          <DynamicUrlList
            urls={portfolioUrls}
            onChange={(urls) => setValue('portfolioUrls', urls)}
            label="作品 URL"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交申請'}
        </Button>
      </div>
    </form>
  );
}
