'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useState } from 'react';
import { Project, Submission } from '@/types';

interface ComparisonPanelProps {
  project: Project;
  submission: Submission;
  onAccept: () => Promise<void>;
  onRequestRevision: (reason: string) => Promise<void>;
  isProcessing?: boolean;
}

export default function ComparisonPanel({ project, submission, onAccept, onRequestRevision, isProcessing }: ComparisonPanelProps) {
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');

  const handleRequestRevision = async () => {
    if (!revisionReason.trim()) return;
    await onRequestRevision(revisionReason);
    setShowRevisionInput(false);
    setRevisionReason('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>原始需求</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">案件敘述</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">交付成果要求</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.deliverables}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">驗收標準</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.acceptanceCriteria}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>提交成果</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">成果說明</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submission.description}</p>
            </div>
            {submission.demoUrl && (
              <div>
                <h4 className="text-sm font-medium">Demo 網址</h4>
                <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {submission.demoUrl}
                </a>
              </div>
            )}
            {submission.githubUrl && (
              <div>
                <h4 className="text-sm font-medium">GitHub 網址</h4>
                <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {submission.githubUrl}
                </a>
              </div>
            )}
            {submission.documentUrl && (
              <div>
                <h4 className="text-sm font-medium">文件網址</h4>
                <a href={submission.documentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {submission.documentUrl}
                </a>
              </div>
            )}
            {submission.fileUrls && (
              <div>
                <h4 className="text-sm font-medium">其他檔案</h4>
                <p className="text-sm text-muted-foreground">{submission.fileUrls}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 justify-end">
        {!showRevisionInput ? (
          <>
            <Button variant="outline" onClick={() => setShowRevisionInput(true)} disabled={isProcessing}>
              要求修改
            </Button>
            <Button onClick={onAccept} disabled={isProcessing}>
              {isProcessing ? '處理中...' : '通過驗收'}
            </Button>
          </>
        ) : (
          <div className="w-full space-y-3">
            <Textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="請描述需要修改的項目與原因..."
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowRevisionInput(false)} disabled={isProcessing}>
                取消
              </Button>
              <Button onClick={handleRequestRevision} disabled={!revisionReason.trim() || isProcessing}>
                送出修改要求
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
