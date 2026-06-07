'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';
import { aiReviewProjectSchema } from '@/lib/validations';
import { chatCompletion } from '@/lib/openai';
import {
  clampScore,
  PROJECT_REVIEW_FIELDS,
  type ProjectReviewFieldKey,
  type ProjectReviewInput,
  type ProjectReviewResult,
} from '@/lib/project-review';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function toReviewInput(input: unknown): ProjectReviewInput | null {
  const normalized = {
    title: normalizeText((input as Record<string, unknown> | null)?.title),
    background: normalizeText((input as Record<string, unknown> | null)?.background),
    description: normalizeText((input as Record<string, unknown> | null)?.description),
    deliverables: normalizeText((input as Record<string, unknown> | null)?.deliverables),
    acceptanceCriteria: normalizeText((input as Record<string, unknown> | null)?.acceptanceCriteria),
  };

  const result = aiReviewProjectSchema.safeParse(normalized);
  return result.success ? result.data : null;
}

function buildValidationMessage(input: ProjectReviewInput) {
  const missing = PROJECT_REVIEW_FIELDS
    .filter((field) => !input[field.key])
    .map((field) => field.label);

  if (missing.length === 0) {
    return '請先補齊案件詳情，再進行 AI 審核。';
  }

  return `請先填寫 ${missing.join('、')}，再進行 AI 審核。`;
}

function improveText(label: string, value: string, hint: string) {
  const cleaned = value.trim();
  if (!cleaned) return '';

  if (label === '案件標題') {
    return cleaned.includes('｜') || cleaned.includes('-') ? cleaned : `${cleaned}｜${hint}`;
  }

  return `${cleaned}\n\n建議補強：${hint}`;
}

function offlineReview(input: ProjectReviewInput): ProjectReviewResult {
  const fieldResults = PROJECT_REVIEW_FIELDS.map((field) => {
    const value = input[field.key];
    const minimum = field.key === 'title' ? 12 : field.key === 'description' ? 120 : 60;
    const score = value.length >= minimum ? 82 : Math.max(48, 82 - (minimum - value.length) / 2);

    const defaultHintByField: Record<ProjectReviewFieldKey, string> = {
      title: '把工作類型、產出形式或目標受眾寫進標題，讓接案方一眼看懂需求。',
      background: '補上案件背景、目前狀況與為什麼要做這個案子，脈絡會更完整。',
      description: '把工作範圍、主要任務與不包含的內容寫清楚，避免合作中誤解。',
      deliverables: '改成條列式成果清單，讓每個交付項目都能被逐一確認。',
      acceptanceCriteria: '把可驗收條件、完成定義與品質標準寫清楚，雙方更容易對齊。',
    };

    return {
      key: field.key,
      label: field.label,
      score: clampScore(score),
      summary:
        value.length >= minimum
          ? `${field.label}已有基本完整度，但還可以再補得更具體。`
          : `${field.label}目前偏簡短，接案方可能很難準確理解你的需求。`,
      suggestedText: improveText(field.label, value, defaultHintByField[field.key]),
      why: [
        `目前字數約 ${value.length}，${value.length >= minimum ? '已具備基本資訊' : '仍偏少'}。`,
        defaultHintByField[field.key],
      ],
    };
  });

  const strengths = fieldResults
    .filter((field) => field.score >= 80)
    .map((field) => `${field.label}已有基礎內容。`);

  const risks = fieldResults
    .filter((field) => field.score < 80)
    .map((field) => `${field.label}過短，可能影響接案理解與後續驗收。`);

  const overallScore = clampScore(
    fieldResults.reduce((sum, field) => sum + field.score, 0) / fieldResults.length
  );

  return {
    overallScore,
    overview:
      overallScore >= 80
        ? '整體內容已有可發佈水準，建議再補強幾個欄位的具體程度，案件會更容易吸引到合適的接案方。'
        : '整體資訊還不夠扎實，建議先逐欄補強，再進入正式發布流程。',
    strengths,
    risks,
    fieldResults,
  };
}

function buildReviewPrompt(validated: ProjectReviewInput) {
  return JSON.stringify(
    {
      instruction:
        '請審核案件內容，並針對每個欄位提出可直接套用的改寫版本。輸出必須是 JSON 物件，不要輸出 markdown，不要輸出額外說明。',
      requiredFormat: {
        overallScore: '0-100 的整數',
        overview: '2-3 句整體評語',
        strengths: ['整體優點 1', '整體優點 2'],
        risks: ['整體風險 1', '整體風險 2'],
        fieldResults: PROJECT_REVIEW_FIELDS.map((field) => ({
          key: field.key,
          label: field.label,
          score: '0-100 的整數',
          summary: '1-2 句指出目前問題',
          suggestedText: '可直接貼回對應欄位的完整建議文字',
          why: ['原因 1', '原因 2'],
        })),
      },
      project: {
        title: validated.title,
        background: validated.background,
        description: validated.description,
        deliverables: validated.deliverables,
        acceptanceCriteria: validated.acceptanceCriteria,
      },
      writingRules: [
        '使用繁體中文',
        '保留商務語氣，避免空泛形容詞',
        '建議文字要能直接拿來當欄位內容使用',
        '若原文已有優點，也要保留其核心資訊',
        '交付成果與驗收標準可適度條列，但仍以字串輸出',
      ],
    },
    null,
    2
  );
}

function normalizeReviewResult(raw: unknown, fallback: ProjectReviewInput): ProjectReviewResult {
  const source = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const sourceFieldResults = Array.isArray(source.fieldResults) ? source.fieldResults : [];

  const fieldResults = PROJECT_REVIEW_FIELDS.map((field, index) => {
    const matched = sourceFieldResults.find(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        (item as Record<string, unknown>).key === field.key
    ) as Record<string, unknown> | undefined;

    const why =
      matched && Array.isArray(matched.why)
        ? matched.why.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];

    return {
      key: field.key,
      label: field.label,
      score: clampScore(typeof matched?.score === 'number' ? matched.score : 72 - index * 2),
      summary:
        typeof matched?.summary === 'string' && matched.summary.trim()
          ? matched.summary.trim()
          : `${field.label}還可以再補得更完整。`,
      suggestedText:
        typeof matched?.suggestedText === 'string' && matched.suggestedText.trim()
          ? matched.suggestedText.trim()
          : fallback[field.key],
      why: why.length > 0 ? why : ['建議補上更完整的細節，讓合作雙方更容易對齊。'],
    };
  });

  return {
    overallScore: clampScore(typeof source.overallScore === 'number' ? source.overallScore : 76),
    overview:
      typeof source.overview === 'string' && source.overview.trim()
        ? source.overview.trim()
        : 'AI 已完成初步審核，建議優先處理右側分數較低的欄位。',
    strengths: Array.isArray(source.strengths)
      ? source.strengths.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [],
    risks: Array.isArray(source.risks)
      ? source.risks.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [],
    fieldResults,
  };
}

export async function aiReviewProject(input: unknown) {
  await getCurrentUser();
  const validated = toReviewInput(input);

  if (!validated) {
    throw new Error(
      buildValidationMessage({
        title: normalizeText((input as Record<string, unknown> | null)?.title),
        background: normalizeText((input as Record<string, unknown> | null)?.background),
        description: normalizeText((input as Record<string, unknown> | null)?.description),
        deliverables: normalizeText((input as Record<string, unknown> | null)?.deliverables),
        acceptanceCriteria: normalizeText((input as Record<string, unknown> | null)?.acceptanceCriteria),
      })
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: true,
      data: { review: offlineReview(validated) },
    };
  }

  try {
    const content = await chatCompletion(
      [
        {
          role: 'system',
          content:
            '你是一位資深案件審稿顧問。請只輸出合法 JSON 物件，不要輸出 markdown，也不要輸出程式碼區塊。',
        },
        { role: 'user', content: buildReviewPrompt(validated) },
      ],
      { maxTokens: 2200, temperature: 0.2, responseFormat: 'json_object' }
    );

    const parsed = JSON.parse(content) as unknown;

    return {
      success: true,
      data: {
        review: normalizeReviewResult(parsed, validated),
      },
    };
  } catch (error) {
    console.error('AI review failed, falling back to offline review:', error);
    return {
      success: true,
      data: {
        review: offlineReview(validated),
      },
    };
  }
}

export async function aiSuggestSkillTags(input: unknown) {
  await getCurrentUser();
  const validated = aiReviewProjectSchema
    .pick({
      title: true,
      background: true,
      description: true,
      deliverables: true,
      acceptanceCriteria: true,
    })
    .partial()
    .safeParse(input);

  if (!validated.success) {
    return { success: true, data: { skillTagIds: [] as string[] } };
  }

  const tags = await prisma.skillTag.findMany({
    where: { isActive: true },
    select: { id: true, name: true, category: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  if (tags.length === 0) {
    return { success: true, data: { skillTagIds: [] as string[] } };
  }

  const content = [
    validated.data.title,
    validated.data.background,
    validated.data.description,
    validated.data.deliverables,
    validated.data.acceptanceCriteria,
  ]
    .filter(Boolean)
    .join('\n\n');

  if (!content.trim()) {
    return { success: true, data: { skillTagIds: [] as string[] } };
  }

  if (!process.env.OPENAI_API_KEY) {
    const lowerContent = content.toLowerCase();
    const matched = tags
      .filter((tag) => lowerContent.includes(tag.name.toLowerCase()))
      .slice(0, 8)
      .map((tag) => tag.id);
    return { success: true, data: { skillTagIds: matched } };
  }

  const tagList = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    category: tag.category?.name ?? null,
  }));

  try {
    const result = await chatCompletion(
      [
        {
          role: 'system',
          content:
            '你是一位專業的案件分類助手。請根據案件內容，從候選技能標籤中選出最相關的 3 到 8 個，並只輸出 JSON：{"skillTagIds":["id"]}。',
        },
        {
          role: 'user',
          content: JSON.stringify({
            project: {
              title: validated.data.title,
              background: validated.data.background,
              description: validated.data.description,
              deliverables: validated.data.deliverables,
              acceptanceCriteria: validated.data.acceptanceCriteria,
            },
            availableSkillTags: tagList,
          }),
        },
      ],
      { maxTokens: 500, temperature: 0.1, responseFormat: 'json_object' }
    );

    const parsed = JSON.parse(result) as { skillTagIds?: unknown };
    const suggestedIds = Array.isArray(parsed.skillTagIds)
      ? parsed.skillTagIds.filter((id): id is string => typeof id === 'string')
      : [];
    const validIds = new Set(tags.map((tag) => tag.id));

    return {
      success: true,
      data: {
        skillTagIds: Array.from(new Set(suggestedIds.filter((id) => validIds.has(id)))).slice(0, 8),
      },
    };
  } catch (error) {
    console.error('AI skill tag suggestion failed:', error);
    const lowerContent = content.toLowerCase();
    const matched = tags
      .filter((tag) => lowerContent.includes(tag.name.toLowerCase()))
      .slice(0, 8)
      .map((tag) => tag.id);
    return { success: true, data: { skillTagIds: matched } };
  }
}
