export type ProjectReviewDraft = {
  backHref: string;
  values: Record<string, unknown>;
  source: 'new' | 'edit';
  projectId?: string;
};

const STORAGE_KEY = 'ai-project-review-draft';

function normalizeDraftValues(values: Record<string, unknown>) {
  const deadline = values.deadline;
  return {
    ...values,
    deadline:
      deadline instanceof Date
        ? deadline.toISOString().slice(0, 10)
        : typeof deadline === 'string'
          ? deadline.slice(0, 10)
          : deadline,
  };
}

export function saveProjectReviewDraft(draft: ProjectReviewDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...draft,
      values: normalizeDraftValues(draft.values),
    })
  );
}

export function loadProjectReviewDraft(): ProjectReviewDraft | null {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ProjectReviewDraft;
  } catch {
    return null;
  }
}

export function clearProjectReviewDraft() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
