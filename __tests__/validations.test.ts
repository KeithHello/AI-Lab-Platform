import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  updateProjectSchema,
  cancelProjectSchema,
  disableProjectSchema,
  applyProjectSchema,
  selectFreelancerSchema,
  submitWorkSchema,
  acceptSubmissionSchema,
  requestRevisionSchema,
  submitReviewSchema,
  submitReportSchema,
  handleReportSchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  createSkillTagSchema,
  updateSkillTagSchema,
  deleteSkillTagSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  deleteAnnouncementSchema,
  createDisputeSchema,
  updateDisputeSchema,
  updateReviewSettingSchema,
  disableUserSchema,
  enableUserSchema,
  completeOnboardingSchema,
  aiReviewProjectSchema,
} from '@/lib/validations';

// ───────────────── Helper ─────────────────
const futureDate = new Date(Date.now() + 86400000); // tomorrow
const pastDate = new Date(Date.now() - 86400000);   // yesterday

const validCreateProject = {
  title: '測試專案',
  categoryId: 'cat1',
  background: '專案背景說明',
  description: '專案詳細敘述',
  deliverables: '交付物清單',
  acceptanceCriteria: '驗收標準',
  budget: 10000,
  currency: 'TWD' as const,
  deadline: futureDate,
  skillTagIds: ['skill1', 'skill2'],
  confidentialityRequired: false,
  saveAsDraft: false,
};

const validApplyProject = {
  projectId: 'proj1',
  description: '我有相關經驗',
  approach: '使用 React + Next.js',
  estimatedDays: 7,
  portfolioUrls: ['https://example.com/portfolio'],
};

const validSubmitWork = {
  projectId: 'proj1',
  description: '已完成開發',
  demoUrl: 'https://example.com/demo',
  githubUrl: 'https://github.com/user/repo',
  fileUrls: ['https://example.com/file.zip'],
};

const validSubmitReview = {
  projectId: 'proj1',
  rating: 5,
  comment: '很棒的體驗',
  wouldCollaborateAgain: true,
};

const validSubmitReport = {
  reportedUserId: 'user2',
  projectId: 'proj1',
  type: 'POOR_QUALITY' as const,
  description: '交付品質不佳',
};

const validCreateCategory = {
  name: '網頁開發',
  description: '網站前端後端開發',
  sortOrder: 1,
};

const validCreateSkillTag = {
  name: 'React',
  categoryId: 'cat1',
};

const validCreateAnnouncement = {
  title: '系統維護公告',
  content: '本週末將進行系統維護',
};

const validCreateDispute = {
  projectId: 'proj1',
  respondentId: 'user2',
  type: 'DELIVERY_QUALITY' as const,
  description: '交付物不符合規格',
};

const validCompleteOnboarding = {
  name: '張三',
  bio: '資深全端工程師',
  role: 'FREELANCER' as const,
  canPostProjects: false,
  canApplyProjects: true,
  skillTagIds: ['skill1', 'skill2'],
};

const validAiReviewProject = {
  title: 'AI 審查專案',
  background: '專案背景',
  description: '專案詳細描述',
  deliverables: '交付文件',
  acceptanceCriteria: '驗收標準明細',
};

// ═══════════════════════════════════════════
// createProjectSchema
// ═══════════════════════════════════════════
describe('createProjectSchema', () => {
  it('accepts valid project input', () => {
    const result = createProjectSchema.safeParse(validCreateProject);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, title: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('title');
  });

  it('rejects title exceeding max length (200)', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, title: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects empty categoryId', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, categoryId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty background', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, background: '' });
    expect(result.success).toBe(false);
  });

  it('rejects background exceeding max length (5000)', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, background: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length (10000)', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, description: 'x'.repeat(10001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty deliverables', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, deliverables: '' });
    expect(result.success).toBe(false);
  });

  it('rejects deliverables exceeding max length (5000)', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, deliverables: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty acceptanceCriteria', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, acceptanceCriteria: '' });
    expect(result.success).toBe(false);
  });

  it('rejects budget <= 0', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, budget: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative budget', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, budget: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid currency', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, currency: 'EUR' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid currencies', () => {
    for (const curr of ['TWD', 'USD', 'JPY', 'HKD', 'CNY']) {
      const result = createProjectSchema.safeParse({ ...validCreateProject, currency: curr });
      expect(result.success).toBe(true);
    }
  });

  it('rejects past deadline', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, deadline: pastDate });
    expect(result.success).toBe(false);
  });

  it('rejects empty skillTagIds array', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, skillTagIds: [] });
    expect(result.success).toBe(false);
  });

  it('rejects missing confidentialityRequired', () => {
    const { confidentialityRequired, ...rest } = validCreateProject;
    const result = createProjectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing saveAsDraft', () => {
    const { saveAsDraft, ...rest } = validCreateProject;
    const result = createProjectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('allows optional references field', () => {
    const result = createProjectSchema.safeParse({ ...validCreateProject, references: 'http://ref.com' });
    expect(result.success).toBe(true);
  });

  it('allows missing optional references', () => {
    const { references, ...rest } = validCreateProject as any;
    const result = createProjectSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════
// updateProjectSchema
// ═══════════════════════════════════════════
describe('updateProjectSchema', () => {
  it('accepts full update with all optional fields', () => {
    const result = updateProjectSchema.safeParse({
      projectId: 'proj1',
      title: '更新標題',
      budget: 20000,
      currency: 'USD',
      deadline: futureDate,
      skillTagIds: ['skill1'],
      confidentialityRequired: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts partial update with only projectId', () => {
    const result = updateProjectSchema.safeParse({ projectId: 'proj1' });
    expect(result.success).toBe(true);
  });

  it('accepts update with only title', () => {
    const result = updateProjectSchema.safeParse({ projectId: 'proj1', title: '新標題' });
    expect(result.success).toBe(true);
  });

  it('rejects missing projectId', () => {
    const result = updateProjectSchema.safeParse({ title: '更新' });
    expect(result.success).toBe(false);
  });

  it('rejects empty projectId', () => {
    const result = updateProjectSchema.safeParse({ projectId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty title in update', () => {
    const result = updateProjectSchema.safeParse({ projectId: 'proj1', title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative budget in update', () => {
    const result = updateProjectSchema.safeParse({ projectId: 'proj1', budget: -500 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid currency in update', () => {
    const result = updateProjectSchema.safeParse({ projectId: 'proj1', currency: 'GBP' });
    expect(result.success).toBe(false);
  });

  it('allows empty skillTagIds array in update', () => {
    const result = updateProjectSchema.safeParse({ projectId: 'proj1', skillTagIds: [] });
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════
// cancelProjectSchema
// ═══════════════════════════════════════════
describe('cancelProjectSchema', () => {
  it('accepts valid cancel input', () => {
    const result = cancelProjectSchema.safeParse({ projectId: 'proj1', reason: '預算不足' });
    expect(result.success).toBe(true);
  });

  it('rejects missing reason', () => {
    const result = cancelProjectSchema.safeParse({ projectId: 'proj1' });
    expect(result.success).toBe(false);
  });

  it('rejects empty reason', () => {
    const result = cancelProjectSchema.safeParse({ projectId: 'proj1', reason: '' });
    expect(result.success).toBe(false);
  });

  it('rejects reason exceeding max length (2000)', () => {
    const result = cancelProjectSchema.safeParse({ projectId: 'proj1', reason: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('rejects missing projectId', () => {
    const result = cancelProjectSchema.safeParse({ reason: '預算不足' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// disableProjectSchema
// ═══════════════════════════════════════════
describe('disableProjectSchema', () => {
  it('accepts valid disable input', () => {
    const result = disableProjectSchema.safeParse({ projectId: 'proj1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId', () => {
    const result = disableProjectSchema.safeParse({ projectId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing projectId', () => {
    const result = disableProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// applyProjectSchema
// ═══════════════════════════════════════════
describe('applyProjectSchema', () => {
  it('accepts valid application', () => {
    const result = applyProjectSchema.safeParse(validApplyProject);
    expect(result.success).toBe(true);
  });

  it('rejects empty description', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length (3000)', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, description: 'x'.repeat(3001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty approach', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, approach: '' });
    expect(result.success).toBe(false);
  });

  it('rejects approach exceeding max length (3000)', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, approach: 'x'.repeat(3001) });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer estimatedDays', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, estimatedDays: 3.5 });
    expect(result.success).toBe(false);
  });

  it('rejects estimatedDays <= 0', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, estimatedDays: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative estimatedDays', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, estimatedDays: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid portfolioUrls', () => {
    const result = applyProjectSchema.safeParse({
      ...validApplyProject,
      portfolioUrls: ['not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty portfolioUrls array', () => {
    const result = applyProjectSchema.safeParse({ ...validApplyProject, portfolioUrls: [] });
    expect(result.success).toBe(true);
  });

  it('rejects missing projectId', () => {
    const { projectId, ...rest } = validApplyProject;
    const result = applyProjectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// selectFreelancerSchema
// ═══════════════════════════════════════════
describe('selectFreelancerSchema', () => {
  it('accepts valid selection', () => {
    const result = selectFreelancerSchema.safeParse({ projectId: 'proj1', freelancerId: 'free1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId', () => {
    const result = selectFreelancerSchema.safeParse({ projectId: '', freelancerId: 'free1' });
    expect(result.success).toBe(false);
  });

  it('rejects empty freelancerId', () => {
    const result = selectFreelancerSchema.safeParse({ projectId: 'proj1', freelancerId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing freelancerId', () => {
    const result = selectFreelancerSchema.safeParse({ projectId: 'proj1' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// submitWorkSchema
// ═══════════════════════════════════════════
describe('submitWorkSchema', () => {
  it('accepts valid submission', () => {
    const result = submitWorkSchema.safeParse(validSubmitWork);
    expect(result.success).toBe(true);
  });

  it('accepts submission without optional URLs', () => {
    const result = submitWorkSchema.safeParse({
      projectId: 'proj1',
      description: '完成開發',
      fileUrls: ['https://example.com/file.zip'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string for optional URLs', () => {
    const result = submitWorkSchema.safeParse({
      projectId: 'proj1',
      description: '完成開發',
      demoUrl: '',
      githubUrl: '',
      documentUrl: '',
      fileUrls: ['https://example.com/file.zip'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid demoUrl', () => {
    const result = submitWorkSchema.safeParse({ ...validSubmitWork, demoUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid githubUrl', () => {
    const result = submitWorkSchema.safeParse({ ...validSubmitWork, githubUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid documentUrl', () => {
    const result = submitWorkSchema.safeParse({ ...validSubmitWork, documentUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = submitWorkSchema.safeParse({ ...validSubmitWork, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length (5000)', () => {
    const result = submitWorkSchema.safeParse({ ...validSubmitWork, description: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid fileUrls', () => {
    const result = submitWorkSchema.safeParse({ ...validSubmitWork, fileUrls: ['not-a-url'] });
    expect(result.success).toBe(false);
  });

  it('rejects missing fileUrls', () => {
    const { fileUrls, ...rest } = validSubmitWork;
    const result = submitWorkSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// acceptSubmissionSchema
// ═══════════════════════════════════════════
describe('acceptSubmissionSchema', () => {
  it('accepts valid input', () => {
    const result = acceptSubmissionSchema.safeParse({ projectId: 'proj1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId', () => {
    const result = acceptSubmissionSchema.safeParse({ projectId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing projectId', () => {
    const result = acceptSubmissionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// requestRevisionSchema
// ═══════════════════════════════════════════
describe('requestRevisionSchema', () => {
  it('accepts valid input', () => {
    const result = requestRevisionSchema.safeParse({ projectId: 'proj1', reason: '需要修改部分功能' });
    expect(result.success).toBe(true);
  });

  it('rejects empty reason', () => {
    const result = requestRevisionSchema.safeParse({ projectId: 'proj1', reason: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing reason', () => {
    const result = requestRevisionSchema.safeParse({ projectId: 'proj1' });
    expect(result.success).toBe(false);
  });

  it('rejects reason exceeding max length (3000)', () => {
    const result = requestRevisionSchema.safeParse({ projectId: 'proj1', reason: 'x'.repeat(3001) });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// submitReviewSchema
// ═══════════════════════════════════════════
describe('submitReviewSchema', () => {
  it('accepts valid review', () => {
    const result = submitReviewSchema.safeParse(validSubmitReview);
    expect(result.success).toBe(true);
  });

  it('accepts review without comment', () => {
    const { comment, ...rest } = validSubmitReview;
    const result = submitReviewSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('rejects rating < 1', () => {
    const result = submitReviewSchema.safeParse({ ...validSubmitReview, rating: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects rating > 5', () => {
    const result = submitReviewSchema.safeParse({ ...validSubmitReview, rating: 6 });
    expect(result.success).toBe(false);
  });

  it('rejects decimal rating', () => {
    const result = submitReviewSchema.safeParse({ ...validSubmitReview, rating: 3.5 });
    expect(result.success).toBe(false);
  });

  it('accepts rating at boundaries (1 and 5)', () => {
    const r1 = submitReviewSchema.safeParse({ ...validSubmitReview, rating: 1 });
    const r5 = submitReviewSchema.safeParse({ ...validSubmitReview, rating: 5 });
    expect(r1.success).toBe(true);
    expect(r5.success).toBe(true);
  });

  it('rejects missing wouldCollaborateAgain', () => {
    const { wouldCollaborateAgain, ...rest } = validSubmitReview;
    const result = submitReviewSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects comment exceeding max length (1000)', () => {
    const result = submitReviewSchema.safeParse({ ...validSubmitReview, comment: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  it('rejects negative rating', () => {
    const result = submitReviewSchema.safeParse({ ...validSubmitReview, rating: -1 });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// submitReportSchema
// ═══════════════════════════════════════════
describe('submitReportSchema', () => {
  it('accepts valid report', () => {
    const result = submitReportSchema.safeParse(validSubmitReport);
    expect(result.success).toBe(true);
  });

  it('accepts report without projectId', () => {
    const { projectId, ...rest } = validSubmitReport;
    const result = submitReportSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('accepts all valid report types', () => {
    for (const t of ['NON_PAYMENT', 'POOR_QUALITY', 'HARASSMENT', 'SPAM', 'OTHER']) {
      const result = submitReportSchema.safeParse({ ...validSubmitReport, type: t });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid report type', () => {
    const result = submitReportSchema.safeParse({ ...validSubmitReport, type: 'INVALID_TYPE' });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = submitReportSchema.safeParse({ ...validSubmitReport, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty reportedUserId', () => {
    const result = submitReportSchema.safeParse({ ...validSubmitReport, reportedUserId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length (3000)', () => {
    const result = submitReportSchema.safeParse({ ...validSubmitReport, description: 'x'.repeat(3001) });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// handleReportSchema
// ═══════════════════════════════════════════
describe('handleReportSchema', () => {
  it('accepts valid handler input', () => {
    const result = handleReportSchema.safeParse({
      reportId: 'rep1',
      status: 'RESOLVED',
      resolution: '已處理',
      disableUser: true,
    });
    expect(result.success).toBe(true);
  });

  it('defaults disableUser to false', () => {
    const result = handleReportSchema.safeParse({ reportId: 'rep1', status: 'UNDER_REVIEW' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disableUser).toBe(false);
    }
  });

  it('accepts all valid statuses', () => {
    for (const s of ['UNDER_REVIEW', 'RESOLVED', 'DISMISSED']) {
      const result = handleReportSchema.safeParse({ reportId: 'rep1', status: s });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = handleReportSchema.safeParse({ reportId: 'rep1', status: 'PENDING' });
    expect(result.success).toBe(false);
  });

  it('rejects empty reportId', () => {
    const result = handleReportSchema.safeParse({ reportId: '', status: 'RESOLVED' });
    expect(result.success).toBe(false);
  });

  it('rejects resolution exceeding max length (3000)', () => {
    const result = handleReportSchema.safeParse({
      reportId: 'rep1',
      status: 'RESOLVED',
      resolution: 'x'.repeat(3001),
    });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// createCategorySchema
// ═══════════════════════════════════════════
describe('createCategorySchema', () => {
  it('accepts valid category', () => {
    const result = createCategorySchema.safeParse(validCreateCategory);
    expect(result.success).toBe(true);
  });

  it('defaults sortOrder to 0', () => {
    const result = createCategorySchema.safeParse({ name: '設計' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(0);
    }
  });

  it('rejects empty name', () => {
    const result = createCategorySchema.safeParse({ ...validCreateCategory, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length (100)', () => {
    const result = createCategorySchema.safeParse({ ...validCreateCategory, name: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer sortOrder', () => {
    const result = createCategorySchema.safeParse({ ...validCreateCategory, sortOrder: 1.5 });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length (500)', () => {
    const result = createCategorySchema.safeParse({ ...validCreateCategory, description: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// updateCategorySchema
// ═══════════════════════════════════════════
describe('updateCategorySchema', () => {
  it('accepts partial update with only categoryId', () => {
    const result = updateCategorySchema.safeParse({ categoryId: 'cat1' });
    expect(result.success).toBe(true);
  });

  it('accepts full update', () => {
    const result = updateCategorySchema.safeParse({
      categoryId: 'cat1',
      name: '新分類',
      description: '新描述',
      sortOrder: 2,
      isActive: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty categoryId', () => {
    const result = updateCategorySchema.safeParse({ categoryId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name in update', () => {
    const result = updateCategorySchema.safeParse({ categoryId: 'cat1', name: '' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// deleteCategorySchema
// ═══════════════════════════════════════════
describe('deleteCategorySchema', () => {
  it('accepts valid delete input', () => {
    const result = deleteCategorySchema.safeParse({ categoryId: 'cat1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty categoryId', () => {
    const result = deleteCategorySchema.safeParse({ categoryId: '' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// createSkillTagSchema
// ═══════════════════════════════════════════
describe('createSkillTagSchema', () => {
  it('accepts valid skill tag', () => {
    const result = createSkillTagSchema.safeParse(validCreateSkillTag);
    expect(result.success).toBe(true);
  });

  it('accepts skill tag without categoryId', () => {
    const result = createSkillTagSchema.safeParse({ name: 'React' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createSkillTagSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length (100)', () => {
    const result = createSkillTagSchema.safeParse({ name: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// updateSkillTagSchema
// ═══════════════════════════════════════════
describe('updateSkillTagSchema', () => {
  it('accepts partial update with only skillTagId', () => {
    const result = updateSkillTagSchema.safeParse({ skillTagId: 'skill1' });
    expect(result.success).toBe(true);
  });

  it('accepts full update', () => {
    const result = updateSkillTagSchema.safeParse({
      skillTagId: 'skill1',
      name: 'Vue.js',
      categoryId: 'cat2',
      isActive: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty skillTagId', () => {
    const result = updateSkillTagSchema.safeParse({ skillTagId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name in update', () => {
    const result = updateSkillTagSchema.safeParse({ skillTagId: 'skill1', name: '' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// deleteSkillTagSchema
// ═══════════════════════════════════════════
describe('deleteSkillTagSchema', () => {
  it('accepts valid delete input', () => {
    const result = deleteSkillTagSchema.safeParse({ skillTagId: 'skill1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty skillTagId', () => {
    const result = deleteSkillTagSchema.safeParse({ skillTagId: '' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// createAnnouncementSchema
// ═══════════════════════════════════════════
describe('createAnnouncementSchema', () => {
  it('accepts valid announcement', () => {
    const result = createAnnouncementSchema.safeParse(validCreateAnnouncement);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createAnnouncementSchema.safeParse({ ...validCreateAnnouncement, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding max length (200)', () => {
    const result = createAnnouncementSchema.safeParse({ ...validCreateAnnouncement, title: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects empty content', () => {
    const result = createAnnouncementSchema.safeParse({ ...validCreateAnnouncement, content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding max length (10000)', () => {
    const result = createAnnouncementSchema.safeParse({ ...validCreateAnnouncement, content: 'x'.repeat(10001) });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// updateAnnouncementSchema
// ═══════════════════════════════════════════
describe('updateAnnouncementSchema', () => {
  it('accepts partial update with only announcementId', () => {
    const result = updateAnnouncementSchema.safeParse({ announcementId: 'ann1' });
    expect(result.success).toBe(true);
  });

  it('accepts full update', () => {
    const result = updateAnnouncementSchema.safeParse({
      announcementId: 'ann1',
      title: '更新公告',
      content: '更新內容',
      isActive: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty announcementId', () => {
    const result = updateAnnouncementSchema.safeParse({ announcementId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty title in update', () => {
    const result = updateAnnouncementSchema.safeParse({ announcementId: 'ann1', title: '' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// deleteAnnouncementSchema
// ═══════════════════════════════════════════
describe('deleteAnnouncementSchema', () => {
  it('accepts valid delete input', () => {
    const result = deleteAnnouncementSchema.safeParse({ announcementId: 'ann1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty announcementId', () => {
    const result = deleteAnnouncementSchema.safeParse({ announcementId: '' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// createDisputeSchema
// ═══════════════════════════════════════════
describe('createDisputeSchema', () => {
  it('accepts valid dispute', () => {
    const result = createDisputeSchema.safeParse(validCreateDispute);
    expect(result.success).toBe(true);
  });

  it('accepts all valid dispute types', () => {
    for (const t of ['PAYMENT_ISSUE', 'DELIVERY_QUALITY', 'SCOPE_CHANGE', 'OTHER']) {
      const result = createDisputeSchema.safeParse({ ...validCreateDispute, type: t });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid dispute type', () => {
    const result = createDisputeSchema.safeParse({ ...validCreateDispute, type: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = createDisputeSchema.safeParse({ ...validCreateDispute, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length (5000)', () => {
    const result = createDisputeSchema.safeParse({ ...validCreateDispute, description: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty projectId', () => {
    const result = createDisputeSchema.safeParse({ ...validCreateDispute, projectId: '' });
    expect(result.success).toBe(false);
  });

  it('accepts omitted respondentId because it is derived from project participants', () => {
    const { respondentId, ...input } = validCreateDispute;
    const result = createDisputeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════
// updateDisputeSchema
// ═══════════════════════════════════════════
describe('updateDisputeSchema', () => {
  it('accepts valid update', () => {
    const result = updateDisputeSchema.safeParse({
      disputeId: 'disp1',
      status: 'UNDER_REVIEW',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all valid statuses', () => {
    for (const s of ['OPEN', 'UNDER_REVIEW', 'RESOLVED']) {
      const result = updateDisputeSchema.safeParse({ disputeId: 'disp1', status: s });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = updateDisputeSchema.safeParse({ disputeId: 'disp1', status: 'CLOSED' });
    expect(result.success).toBe(false);
  });

  it('rejects empty disputeId', () => {
    const result = updateDisputeSchema.safeParse({ disputeId: '', status: 'OPEN' });
    expect(result.success).toBe(false);
  });

  it('rejects respondentStatement exceeding max length (5000)', () => {
    const result = updateDisputeSchema.safeParse({
      disputeId: 'disp1',
      status: 'OPEN',
      respondentStatement: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects resolution exceeding max length (3000)', () => {
    const result = updateDisputeSchema.safeParse({
      disputeId: 'disp1',
      status: 'RESOLVED',
      resolution: 'x'.repeat(3001),
    });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// updateReviewSettingSchema
// ═══════════════════════════════════════════
describe('updateReviewSettingSchema', () => {
  it('accepts valid USER_ONBOARDING setting', () => {
    const result = updateReviewSettingSchema.safeParse({ reviewType: 'USER_ONBOARDING', isEnabled: true });
    expect(result.success).toBe(true);
  });

  it('accepts valid PROJECT_PUBLISH setting', () => {
    const result = updateReviewSettingSchema.safeParse({ reviewType: 'PROJECT_PUBLISH', isEnabled: false });
    expect(result.success).toBe(true);
  });

  it('rejects invalid reviewType', () => {
    const result = updateReviewSettingSchema.safeParse({ reviewType: 'INVALID', isEnabled: true });
    expect(result.success).toBe(false);
  });

  it('rejects missing isEnabled', () => {
    const result = updateReviewSettingSchema.safeParse({ reviewType: 'USER_ONBOARDING' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// disableUserSchema
// ═══════════════════════════════════════════
describe('disableUserSchema', () => {
  it('accepts valid input', () => {
    const result = disableUserSchema.safeParse({ userId: 'user1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty userId', () => {
    const result = disableUserSchema.safeParse({ userId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing userId', () => {
    const result = disableUserSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// enableUserSchema
// ═══════════════════════════════════════════
describe('enableUserSchema', () => {
  it('accepts valid input', () => {
    const result = enableUserSchema.safeParse({ userId: 'user1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty userId', () => {
    const result = enableUserSchema.safeParse({ userId: '' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════
// completeOnboardingSchema
// ═══════════════════════════════════════════
describe('completeOnboardingSchema', () => {
  it('accepts valid freelancer onboarding', () => {
    const result = completeOnboardingSchema.safeParse(validCompleteOnboarding);
    expect(result.success).toBe(true);
  });

  it('accepts all valid roles', () => {
    for (const r of ['CLIENT', 'FREELANCER', 'BOTH']) {
      const result = completeOnboardingSchema.safeParse({ ...validCompleteOnboarding, role: r });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid role', () => {
    const result = completeOnboardingSchema.safeParse({ ...validCompleteOnboarding, role: 'ADMIN' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = completeOnboardingSchema.safeParse({ ...validCompleteOnboarding, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length (100)', () => {
    const result = completeOnboardingSchema.safeParse({ ...validCompleteOnboarding, name: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects empty skillTagIds array', () => {
    const result = completeOnboardingSchema.safeParse({ ...validCompleteOnboarding, skillTagIds: [] });
    expect(result.success).toBe(false);
  });

  it('accepts missing bio', () => {
    const { bio, ...rest } = validCompleteOnboarding;
    const result = completeOnboardingSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('rejects bio exceeding max length (500)', () => {
    const result = completeOnboardingSchema.safeParse({ ...validCompleteOnboarding, bio: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('accepts missing role because capabilities are the source of truth', () => {
    const { role, ...rest } = validCompleteOnboarding;
    const result = completeOnboardingSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('accepts post-only capability', () => {
    const result = completeOnboardingSchema.safeParse({
      ...validCompleteOnboarding,
      canPostProjects: true,
      canApplyProjects: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts apply-only capability', () => {
    const result = completeOnboardingSchema.safeParse({
      ...validCompleteOnboarding,
      canPostProjects: false,
      canApplyProjects: true,
    });
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════
// aiReviewProjectSchema
// ═══════════════════════════════════════════
describe('aiReviewProjectSchema', () => {
  it('accepts valid AI review input', () => {
    const result = aiReviewProjectSchema.safeParse(validAiReviewProject);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding max length (200)', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, title: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects empty background', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, background: '' });
    expect(result.success).toBe(false);
  });

  it('rejects background exceeding max length (5000)', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, background: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length (10000)', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, description: 'x'.repeat(10001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty deliverables', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, deliverables: '' });
    expect(result.success).toBe(false);
  });

  it('rejects deliverables exceeding max length (5000)', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, deliverables: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('rejects empty acceptanceCriteria', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, acceptanceCriteria: '' });
    expect(result.success).toBe(false);
  });

  it('rejects acceptanceCriteria exceeding max length (5000)', () => {
    const result = aiReviewProjectSchema.safeParse({ ...validAiReviewProject, acceptanceCriteria: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });
});
