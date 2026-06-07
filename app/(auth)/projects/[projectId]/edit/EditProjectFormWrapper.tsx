'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import ProjectForm, { ProjectFormData } from '@/components/project/ProjectForm';
import { updateProject } from '@/actions/project.actions';
import { aiSuggestSkillTags } from '@/actions/ai-review.actions';
import { Category, SkillTag } from '@/types';
import { createProjectSchema } from '@/lib/validations';
import { toast } from '@/components/ui/use-toast';
import { clearProjectReviewDraft, loadProjectReviewDraft } from '@/lib/project-review-draft';

type EditProjectFormWrapperProps = {
  project: {
    id: string;
    title: string;
    categoryId: string;
    background: string;
    description: string;
    deliverables: string;
    acceptanceCriteria: string;
    budget: number;
    currency: string;
    deadline: Date;
    confidentialityRequired: boolean;
    references: string | null;
    projectSkills: { skillTag: SkillTag }[];
  };
  categories: Category[];
  skillTags: SkillTag[];
};

export default function EditProjectFormWrapper({ project, categories, skillTags }: EditProjectFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<ProjectFormData> | undefined>(undefined);

  useEffect(() => {
    const draft = loadProjectReviewDraft();
    const baseValues: Partial<ProjectFormData> = {
      title: project.title,
      categoryId: project.categoryId,
      background: project.background,
      description: project.description,
      deliverables: project.deliverables,
      acceptanceCriteria: project.acceptanceCriteria,
      budget: Number(project.budget),
      currency: project.currency as ProjectFormData['currency'],
      deadline: new Date(project.deadline),
      skillTagIds: project.projectSkills.map((ps) => ps.skillTag.id),
      confidentialityRequired: project.confidentialityRequired,
      references: project.references || '',
    };

    const restoredDraft =
      draft?.source === 'edit' && draft.backHref === `/projects/${project.id}/edit`
        ? (draft.values as Partial<ProjectFormData>)
        : undefined;

    setDefaultValues({ ...baseValues, ...restoredDraft });
    setIsReady(true);
  }, [project]);

  const handleSubmit = async (data: z.infer<typeof createProjectSchema>) => {
    setIsSubmitting(true);
    try {
      await updateProject({ ...data, projectId: project.id });
      clearProjectReviewDraft();
      toast({ title: '案件已更新' });
      router.push(`/projects/${project.id}`);
    } catch (error) {
      toast({
        title: '更新失敗',
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
      reviewBackHref={`/projects/${project.id}/edit`}
    />
  );
}
