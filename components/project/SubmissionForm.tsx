'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicUrlList from './DynamicUrlList';
import { submitWorkSchema } from '@/lib/validations';
import { z } from 'zod';

type FormData = z.infer<typeof submitWorkSchema>;

interface SubmissionFormProps {
  projectId: string;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function SubmissionForm({ projectId, onSubmit, isSubmitting }: SubmissionFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(submitWorkSchema),
    defaultValues: {
      projectId,
      description: '',
      demoUrl: '',
      githubUrl: '',
      documentUrl: '',
      fileUrls: [],
    },
  });

  const fileUrls = watch('fileUrls');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('projectId')} />

      <Card>
        <CardHeader><CardTitle>提交說明</CardTitle></CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium">成果說明</label>
            <Textarea {...register('description')} placeholder="描述你完成的成果內容" rows={4} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>成果連結</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Demo 網址</label>
            <Input {...register('demoUrl')} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium">GitHub 網址</label>
            <Input {...register('githubUrl')} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="text-sm font-medium">文件網址</label>
            <Input {...register('documentUrl')} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium">其他檔案網址</label>
            <DynamicUrlList
              urls={fileUrls}
              onChange={(urls) => setValue('fileUrls', urls)}
              label="檔案 URL"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交成果'}
        </Button>
      </div>
    </form>
  );
}
