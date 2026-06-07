'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/input';
import { submitReportSchema } from '@/lib/validations';
import { z } from 'zod';

type FormData = z.infer<typeof submitReportSchema>;

interface ReportFormProps {
  reportedUserId: string;
  projectId?: string;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

const reportTypeOptions = [
  { value: 'NON_PAYMENT', label: '未付款或付款異常' },
  { value: 'POOR_QUALITY', label: '品質或交付問題' },
  { value: 'HARASSMENT', label: '騷擾或不當行為' },
  { value: 'SPAM', label: '垃圾訊息或詐騙' },
  { value: 'OTHER', label: '其他' },
];

export default function ReportForm({ reportedUserId, projectId, onSubmit, isSubmitting }: ReportFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(submitReportSchema),
    defaultValues: {
      reportedUserId,
      projectId,
      type: 'OTHER',
      description: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register('reportedUserId')} />
      {projectId && <input type="hidden" {...register('projectId')} />}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">舉報類型</label>
        <Select {...register('type')} options={reportTypeOptions} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">詳細描述</label>
        <Textarea {...register('description')} placeholder="請描述發生了什麼、相關時間點與你希望平台協助確認的內容。" rows={5} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Flag data-icon="inline-start" />
          {isSubmitting ? '提交中...' : '提交舉報'}
        </Button>
      </div>
    </form>
  );
}
