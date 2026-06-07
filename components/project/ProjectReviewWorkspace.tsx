'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CopyPlus,
  Expand,
  Loader2,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { aiReviewProject } from '@/actions/ai-review.actions';
import { saveProjectReviewDraft, loadProjectReviewDraft, type ProjectReviewDraft } from '@/lib/project-review-draft';
import {
  PROJECT_REVIEW_FIELDS,
  type ProjectReviewFieldKey,
  type ProjectReviewInput,
  type ProjectReviewResult,
} from '@/lib/project-review';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';

type ReviewState =
  | { status: 'loading' }
  | { status: 'ready'; review: ProjectReviewResult }
  | { status: 'error'; message: string };

const FIELD_HEIGHTS: Record<ProjectReviewFieldKey, string> = {
  title: 'min-h-[56px]',
  background: 'min-h-[160px]',
  description: 'min-h-[220px]',
  deliverables: 'min-h-[180px]',
  acceptanceCriteria: 'min-h-[180px]',
};

function toProjectReviewInput(values: Record<string, unknown>): ProjectReviewInput {
  return {
    title: typeof values.title === 'string' ? values.title : '',
    background: typeof values.background === 'string' ? values.background : '',
    description: typeof values.description === 'string' ? values.description : '',
    deliverables: typeof values.deliverables === 'string' ? values.deliverables : '',
    acceptanceCriteria: typeof values.acceptanceCriteria === 'string' ? values.acceptanceCriteria : '',
  };
}

function scoreTone(score: number) {
  if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

function EditableFieldCard({
  fieldKey,
  label,
  value,
  onChange,
  onExpand,
}: {
  fieldKey: ProjectReviewFieldKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onExpand?: () => void;
}) {
  const isMultiline = fieldKey !== 'title';

  return (
    <div className="rounded-xl border border-border/60 bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          {isMultiline && <div className="text-xs text-muted-foreground">可直接在這裡修改，也能展開成大視窗編輯。</div>}
        </div>
        {isMultiline && (
          <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onExpand}>
            <Expand className="h-4 w-4" />
            放大編輯
          </Button>
        )}
      </div>

      <div className="p-4">
        {fieldKey === 'title' ? (
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="請輸入案件標題"
            className="h-12 rounded-xl"
          />
        ) : (
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={`請輸入${label}`}
            className={`${FIELD_HEIGHTS[fieldKey]} resize-y rounded-xl leading-7`}
          />
        )}
      </div>
    </div>
  );
}

export default function ProjectReviewWorkspace() {
  const router = useRouter();
  const [draft, setDraft] = useState<ProjectReviewDraft | null>(null);
  const [formValues, setFormValues] = useState<ProjectReviewInput | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>({ status: 'loading' });
  const [expandedField, setExpandedField] = useState<ProjectReviewFieldKey | null>(null);

  const syncDraft = useCallback(
    (nextValues: ProjectReviewInput) => {
      setDraft((currentDraft) => {
        if (!currentDraft) return currentDraft;
        const nextDraft = {
          ...currentDraft,
          values: {
            ...currentDraft.values,
            ...nextValues,
          },
        };
        saveProjectReviewDraft(nextDraft);
        return nextDraft;
      });
    },
    []
  );

  const updateField = useCallback(
    (fieldKey: ProjectReviewFieldKey, value: string) => {
      setFormValues((currentValues) => {
        if (!currentValues) return currentValues;
        const nextValues = { ...currentValues, [fieldKey]: value };
        syncDraft(nextValues);
        return nextValues;
      });
    },
    [syncDraft]
  );

  const runReview = useCallback(async (values: ProjectReviewInput) => {
    setReviewState({ status: 'loading' });

    try {
      const result = await aiReviewProject(values);
      setReviewState({ status: 'ready', review: result.data.review });
    } catch (error) {
      setReviewState({
        status: 'error',
        message: error instanceof Error ? error.message : 'AI 審核失敗，請稍後再試。',
      });
    }
  }, []);

  useEffect(() => {
    const loadedDraft = loadProjectReviewDraft();
    if (!loadedDraft) {
      router.replace('/projects/new');
      return;
    }

    const initialValues = toProjectReviewInput(loadedDraft.values);
    setDraft(loadedDraft);
    setFormValues(initialValues);
    runReview(initialValues);
  }, [router, runReview]);

  const categoryLabel = useMemo(() => {
    if (!draft) return '未選分類';
    return typeof draft.values.categoryId === 'string' && draft.values.categoryId ? '已選分類' : '未選分類';
  }, [draft]);

  if (!draft || !formValues) {
    return null;
  }

  const reviewBackHref = draft.backHref;
  const expandedFieldConfig = expandedField
    ? PROJECT_REVIEW_FIELDS.find((field) => field.key === expandedField) ?? null
    : null;

  const handleComplete = () => {
    saveProjectReviewDraft({
      ...draft,
      values: {
        ...draft.values,
        ...formValues,
      },
    });
    router.push(reviewBackHref);
  };

  const handleApplySuggestion = (fieldKey: ProjectReviewFieldKey, nextText: string) => {
    updateField(fieldKey, nextText);
    toast({ title: '已套用 AI 建議', description: '內容已更新到對應欄位。' });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit">
            AI 審核工作區
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">案件詳情與 AI 審核建議</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            左邊直接改稿，右邊看 AI 對每個欄位的建議，再一鍵套用到對應位置。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(reviewBackHref)}>
            <ArrowLeft data-icon="inline-start" />
            返回編輯
          </Button>
          <Button onClick={handleComplete}>完成</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader className="border-b bg-muted/20 py-4">
            <CardTitle className="text-base font-bold">案件詳情</CardTitle>
            <CardDescription>
              先在左側調整文字，再參考右側建議逐欄修正。完成後會帶著最新內容回到原本表單。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{categoryLabel}</Badge>
              <Badge variant="outline">{draft.source === 'edit' ? '編輯模式' : '新案件'}</Badge>
            </div>

            {PROJECT_REVIEW_FIELDS.map((field) => (
              <EditableFieldCard
                key={field.key}
                fieldKey={field.key}
                label={field.label}
                value={formValues[field.key]}
                onChange={(value) => updateField(field.key, value)}
                onExpand={field.multiline ? () => setExpandedField(field.key) : undefined}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/60 shadow-sm lg:sticky lg:top-24">
          <CardHeader className="border-b bg-muted/20 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Sparkles data-icon="inline-start" />
                  AI 審核結果
                </CardTitle>
                <CardDescription>這裡會把建議拆成可操作的欄位卡片，不再直接顯示原始 markdown。</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => runReview(formValues)}
                disabled={reviewState.status === 'loading'}
              >
                {reviewState.status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                重新審核
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex max-h-[calc(100dvh-15rem)] flex-col gap-4 overflow-y-auto pt-6">
            {reviewState.status === 'loading' && (
              <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                AI 正在整理案件內容與修改建議...
              </div>
            )}

            {reviewState.status === 'error' && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {reviewState.message}
              </div>
            )}

            {reviewState.status === 'ready' && (
              <>
                <div className="rounded-xl border border-border/60 bg-background p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-foreground">整體判讀</div>
                      <p className="text-sm leading-7 text-muted-foreground">{reviewState.review.overview}</p>
                    </div>
                    <div
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${scoreTone(
                        reviewState.review.overallScore
                      )}`}
                    >
                      {reviewState.review.overallScore} 分
                    </div>
                  </div>

                  {(reviewState.review.strengths.length > 0 || reviewState.review.risks.length > 0) && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-muted/20 p-4">
                        <div className="mb-2 text-sm font-semibold text-foreground">亮點</div>
                        {reviewState.review.strengths.length > 0 ? (
                          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                            {reviewState.review.strengths.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">目前尚未整理出明確亮點。</p>
                        )}
                      </div>

                      <div className="rounded-lg bg-muted/20 p-4">
                        <div className="mb-2 text-sm font-semibold text-foreground">風險</div>
                        {reviewState.review.risks.length > 0 ? (
                          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                            {reviewState.review.risks.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">目前沒有特別明顯的風險。</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {reviewState.review.fieldResults.map((fieldReview) => (
                  <div key={fieldReview.key} className="rounded-xl border border-border/60 bg-background p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-foreground">{fieldReview.label}</div>
                        <p className="text-sm leading-6 text-muted-foreground">{fieldReview.summary}</p>
                      </div>
                      <div
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(
                          fieldReview.score
                        )}`}
                      >
                        {fieldReview.score} 分
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-border/60 bg-muted/10 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        AI 建議稿
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                        {fieldReview.suggestedText || '目前沒有建議稿。'}
                      </div>
                    </div>

                    {fieldReview.why.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          為什麼這樣改
                        </div>
                        <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                          {fieldReview.why.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleApplySuggestion(fieldReview.key, fieldReview.suggestedText)}
                      >
                        <CopyPlus className="h-4 w-4" />
                        套用到{fieldReview.label}
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>

          <div className="flex justify-end border-t bg-muted/10 px-6 py-4">
            <Button variant="outline" onClick={handleComplete}>
              <Check className="h-4 w-4" />
              完成並返回
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={Boolean(expandedFieldConfig)} onOpenChange={(open) => !open && setExpandedField(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{expandedFieldConfig?.label}</DialogTitle>
            <DialogDescription>在大視窗中編輯長內容，修改會即時同步回左側欄位。</DialogDescription>
          </DialogHeader>

          {expandedFieldConfig && (
            <Textarea
              value={formValues[expandedFieldConfig.key]}
              onChange={(event) => updateField(expandedFieldConfig.key, event.target.value)}
              className="min-h-[60dvh] resize-none rounded-xl leading-7"
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExpandedField(null)}>
              完成編輯
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
