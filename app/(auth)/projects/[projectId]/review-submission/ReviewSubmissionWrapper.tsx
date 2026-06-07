'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ComparisonPanel from '@/components/project/ComparisonPanel';
import { acceptSubmission, requestRevision } from '@/actions/submission.actions';
import { toast } from '@/components/ui/use-toast';
import { Project, Submission } from '@/types';

interface ReviewSubmissionWrapperProps {
  project: Project;
  submission: Submission;
}

export default function ReviewSubmissionWrapper({ project, submission }: ReviewSubmissionWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptSubmission({ projectId: project.id });
      toast({ title: '驗收通過，請進行評價' });
      router.push(`/projects/${project.id}/review`);
    } catch (error) {
      toast({ title: '操作失敗', description: error instanceof Error ? error.message : '請稍後再試', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async (reason: string) => {
    setIsProcessing(true);
    try {
      await requestRevision({ projectId: project.id, reason });
      toast({ title: '已發出修改要求' });
      router.push(`/projects/${project.id}`);
    } catch (error) {
      toast({ title: '操作失敗', description: error instanceof Error ? error.message : '請稍後再試', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  return (
    <ComparisonPanel
      project={project}
      submission={submission}
      onAccept={handleAccept}
      onRequestRevision={handleRequestRevision}
      isProcessing={isProcessing}
    />
  );
}
