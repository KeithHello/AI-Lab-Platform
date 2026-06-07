'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SubmissionForm from '@/components/project/SubmissionForm';
import { submitWork } from '@/actions/submission.actions';
import { toast } from '@/components/ui/use-toast';

export default function SubmitWorkWrapper({ projectId }: { projectId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    try {
      await submitWork(data);
      toast({ title: '成果已提交' });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast({ title: '提交失敗', description: error instanceof Error ? error.message : '請稍後再試', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  return (
    <SubmissionForm
      projectId={projectId}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
