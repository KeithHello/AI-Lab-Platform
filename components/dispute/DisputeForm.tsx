'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/input';
import { createDisputeSchema } from '@/lib/validations';
import { z } from 'zod';

type FormData = z.infer<typeof createDisputeSchema>;

interface DisputeFormProps {
  projectId: string;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

const disputeTypeOptions = [
  { value: 'PAYMENT_ISSUE', label: '付款問題' },
  { value: 'DELIVERY_QUALITY', label: '交付品質' },
  { value: 'SCOPE_CHANGE', label: '需求範圍變更' },
  { value: 'OTHER', label: '其他' },
];

export default function DisputeForm({ projectId, onSubmit, isSubmitting }: DisputeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createDisputeSchema),
    defaultValues: {
      projectId,
      type: 'OTHER',
      description: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register('projectId')} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">糾紛類型</label>
        <Select {...register('type')} options={disputeTypeOptions} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">詳細描述</label>
        <Textarea {...register('description')} placeholder="請描述爭議內容、目前卡住的原因、你期望平台如何協助裁決。" rows={5} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <AlertTriangle data-icon="inline-start" />
          {isSubmitting ? '提交中...' : '提出糾紛'}
        </Button>
      </div>
    </form>
  );
}
