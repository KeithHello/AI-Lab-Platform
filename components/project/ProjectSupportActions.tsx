'use client';

import { useState } from 'react';
import { AlertTriangle, Flag } from 'lucide-react';
import { createDispute } from '@/actions/dispute.actions';
import { submitReport } from '@/actions/report.actions';
import DisputeForm from '@/components/dispute/DisputeForm';
import ReportForm from '@/components/report/ReportForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type SupportTarget = {
  id: string;
  name: string;
  roleLabel: string;
};

interface ProjectSupportActionsProps {
  projectId: string;
  reportTarget?: SupportTarget;
  canCreateDispute: boolean;
}

export default function ProjectSupportActions({
  projectId,
  reportTarget,
  canCreateDispute,
}: ProjectSupportActionsProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  async function handleReport(data: Parameters<typeof submitReport>[0]) {
    try {
      setIsReporting(true);
      await submitReport(data);
      toast({ title: '已提交舉報', description: '管理員會在舉報管理中進行確認。' });
      setReportOpen(false);
    } catch (error) {
      toast({
        title: '提交失敗',
        description: error instanceof Error ? error.message : '無法提交舉報',
        variant: 'destructive',
      });
    } finally {
      setIsReporting(false);
    }
  }

  async function handleDispute(data: Parameters<typeof createDispute>[0]) {
    try {
      setIsDisputing(true);
      await createDispute(data);
      toast({ title: '已提出糾紛', description: '管理員會在糾紛記錄中跟進處理。' });
      setDisputeOpen(false);
    } catch (error) {
      toast({
        title: '提交失敗',
        description: error instanceof Error ? error.message : '無法提出糾紛',
        variant: 'destructive',
      });
    } finally {
      setIsDisputing(false);
    }
  }

  if (!reportTarget && !canCreateDispute) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
      {reportTarget && (
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Flag data-icon="inline-start" />
              舉報{reportTarget.roleLabel}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>舉報{reportTarget.roleLabel}</DialogTitle>
              <DialogDescription>
                你正在舉報 {reportTarget.name}。這會送到管理員後台的舉報管理。
              </DialogDescription>
            </DialogHeader>
            <ReportForm
              reportedUserId={reportTarget.id}
              projectId={projectId}
              onSubmit={handleReport}
              isSubmitting={isReporting}
            />
          </DialogContent>
        </Dialog>
      )}

      {canCreateDispute && (
        <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <AlertTriangle data-icon="inline-start" />
              提出糾紛
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>提出案件糾紛</DialogTitle>
              <DialogDescription>
                糾紛會送到管理員後台的糾紛記錄，由平台協助確認合作爭議。
              </DialogDescription>
            </DialogHeader>
            <DisputeForm projectId={projectId} onSubmit={handleDispute} isSubmitting={isDisputing} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
