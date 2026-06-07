'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApplicationForm from '@/components/project/ApplicationForm';
import { applyProject } from '@/actions/application.actions';
import { toast } from '@/components/ui/use-toast';

export default function ApplyProjectWrapper({ projectId }: { projectId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    try {
      await applyProject(data);
      toast({ title: '申請已提交' });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast({ title: '申請失敗', description: error instanceof Error ? error.message : '請稍後再試', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  return (
    <ApplicationForm
      projectId={projectId}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
