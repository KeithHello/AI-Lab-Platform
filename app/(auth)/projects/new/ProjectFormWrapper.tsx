'use client';

import { useEffect, useState } from 'react';
import ProjectForm, { ProjectFormData } from '@/components/project/ProjectForm';
import { createProject } from '@/actions/project.actions';
import { aiSuggestSkillTags } from '@/actions/ai-review.actions';
import { Category, SkillTag } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { clearProjectReviewDraft, loadProjectReviewDraft } from '@/lib/project-review-draft';

export default function ProjectFormWrapper({ categories, skillTags }: { categories: Category[]; skillTags: SkillTag[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<ProjectFormData> | undefined>(undefined);

  useEffect(() => {
    const draft = loadProjectReviewDraft();
    setDefaultValues(
      draft?.source === 'new' && draft.backHref === '/projects/new'
        ? (draft.values as Partial<ProjectFormData>)
        : undefined
    );
    setIsReady(true);
  }, []);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      clearProjectReviewDraft();
      toast({ title: '案件已發布' });
    } catch (error) {
      toast({
        title: '發布失敗',
        description: error instanceof Error ? error.message : '請稍後再試。',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleAiSuggestSkillTags = async (data: Partial<ProjectFormData>) => {
    const result = await aiSuggestSkillTags(data);
    return result.data.skillTagIds;
  };

  if (!isReady) {
    return (
      <div className="rounded-xl border border-border/60 p-6 text-sm text-muted-foreground">
        正在準備草稿資料...
      </div>
    );
  }

  return (
    <ProjectForm
      categories={categories}
      skillTags={skillTags}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onAiSuggestSkillTags={handleAiSuggestSkillTags}
      isSubmitting={isSubmitting}
      reviewBackHref="/projects/new"
    />
  );
}
