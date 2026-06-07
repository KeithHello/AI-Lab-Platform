export const PROJECT_REVIEW_FIELDS = [
  { key: 'title', label: '案件標題', multiline: false },
  { key: 'background', label: '案件背景', multiline: true },
  { key: 'description', label: '案件敘述', multiline: true },
  { key: 'deliverables', label: '交付成果', multiline: true },
  { key: 'acceptanceCriteria', label: '驗收標準', multiline: true },
] as const;

export type ProjectReviewFieldKey = (typeof PROJECT_REVIEW_FIELDS)[number]['key'];

export type ProjectReviewInput = Record<ProjectReviewFieldKey, string>;

export type ProjectReviewFieldResult = {
  key: ProjectReviewFieldKey;
  label: string;
  score: number;
  summary: string;
  suggestedText: string;
  why: string[];
};

export type ProjectReviewResult = {
  overallScore: number;
  overview: string;
  strengths: string[];
  risks: string[];
  fieldResults: ProjectReviewFieldResult[];
};

export function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}
