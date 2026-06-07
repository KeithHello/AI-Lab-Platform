'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApplicantCard from '@/components/project/ApplicantCard';
import { selectFreelancer } from '@/actions/application.actions';
import { toast } from '@/components/ui/use-toast';
import { ApplicationStatus, User, SkillTag } from '@/types';

interface SelectFreelancerWrapperProps {
  application: {
    id: string;
    projectId: string;
    freelancerId: string;
    description: string;
    approach: string;
    estimatedDays: number;
    portfolioUrls: string | null;
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
    freelancer: User & {
      skills: { skillTag: SkillTag }[];
    };
  };
  projectId: string;
}

export default function SelectFreelancerWrapper({ application, projectId }: SelectFreelancerWrapperProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const router = useRouter();

  const handleSelect = async () => {
    if (!confirm('確定選擇此接案者？其他申請者將自動拒絕。')) return;
    setIsSelecting(true);
    try {
      await selectFreelancer({ projectId, freelancerId: application.freelancerId });
      toast({ title: '已選定接案者' });
      router.refresh();
    } catch (error) {
      toast({ title: '操作失敗', description: error instanceof Error ? error.message : '請稍後再試', variant: 'destructive' });
      setIsSelecting(false);
    }
  };

  return (
    <ApplicantCard
      application={application}
      onSelect={handleSelect}
      disabled={isSelecting}
    />
  );
}
