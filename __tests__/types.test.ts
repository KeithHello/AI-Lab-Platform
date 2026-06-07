import { describe, it, expect } from 'vitest';
import type {
  User,
  Category,
  SkillTag,
  Reward,
  Currency,
  ProjectStatus,
  Project,
  ProjectCardData,
  ApplicationStatus,
  Application,
  Submission,
  Review,
  ReportStatus,
  Report,
  DisputeStatus,
  Dispute,
  Announcement,
  ReviewSettingType,
  ReviewSetting,
  CreateProjectInput,
  ApplyProjectInput,
  SubmitWorkInput,
  SubmitReviewInput,
  SubmitReportInput,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

// Import related schemas for consistency checking
import {
  submitReviewSchema,
  createProjectSchema,
  submitReportSchema,
  createDisputeSchema,
  updateDisputeSchema,
  completeOnboardingSchema,
  updateReviewSettingSchema,
  handleReportSchema,
  applyProjectSchema,
  submitWorkSchema,
} from '@/lib/validations';

// ═══════════════════════════════════════════
// Type export verification (compile-time)
// These tests verify that types can be imported
// They will fail at compile time if types are missing
// ═══════════════════════════════════════════
describe('Type exports', () => {
  it('User type is defined', () => {
    // Runtime structural check: verify the shape
    const user: Partial<User> = {
      id: '1',
      clerkId: 'ck1',
      email: 'test@test.com',
      name: 'Test',
      role: 'FREELANCER',
      status: 'ACTIVE',
      isAdmin: false,
      onboardingCompleted: true,
    };
    expect(user.role).toBe('FREELANCER');
    expect(user.status).toBe('ACTIVE');
  });

  it('Category type is defined', () => {
    const cat: Partial<Category> = {
      id: 'cat1',
      name: 'Web',
      isActive: true,
      sortOrder: 0,
    };
    expect(cat.name).toBe('Web');
  });

  it('SkillTag type is defined', () => {
    const tag: Partial<SkillTag> = {
      id: 'tag1',
      name: 'React',
      isActive: true,
    };
    expect(tag.name).toBe('React');
  });

  it('Project type is defined with all statuses', () => {
    const validStatuses: ProjectStatus[] = [
      'DRAFT', 'OPEN', 'IN_PROGRESS', 'SUBMITTED',
      'REVISION_REQUESTED', 'COMPLETED', 'CANCELLED', 'DISABLED',
    ];
    expect(validStatuses).toHaveLength(8);
  });

  it('Currency union type has 5 members', () => {
    const currencies: Currency[] = ['TWD', 'USD', 'JPY', 'HKD', 'CNY'];
    expect(currencies).toHaveLength(5);
  });

  it('ApplicationStatus has 3 values', () => {
    const statuses: ApplicationStatus[] = ['PENDING', 'ACCEPTED', 'REJECTED'];
    expect(statuses).toHaveLength(3);
  });

  it('ReportStatus has 4 values', () => {
    const statuses: ReportStatus[] = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
    expect(statuses).toHaveLength(4);
  });

  it('DisputeStatus has 3 values', () => {
    const statuses: DisputeStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED'];
    expect(statuses).toHaveLength(3);
  });

  it('ReviewSettingType has 2 values', () => {
    const types: ReviewSettingType[] = ['USER_ONBOARDING', 'PROJECT_PUBLISH'];
    expect(types).toHaveLength(2);
  });

  it('ApiResponse generic type is structurally valid', () => {
    const success: ApiResponse<string> = { success: true, data: 'ok' };
    const error: ApiResponse = { success: false, error: 'fail' };
    expect(success.success).toBe(true);
    expect(error.success).toBe(false);
    expect(error.error).toBe('fail');
  });

  it('PaginatedResponse has pagination fields', () => {
    const page: PaginatedResponse<Project> = {
      success: true,
      data: [],
      total: 100,
      page: 1,
      pageSize: 10,
      totalPages: 10,
    };
    expect(page.totalPages).toBe(10);
    expect(page.pageSize).toBe(10);
  });

  it('Reward type has budget and currency', () => {
    const reward: Reward = { budget: 5000, currency: 'TWD' };
    expect(reward.currency).toBe('TWD');
  });

  it('CreateProjectInput has all required fields', () => {
    const input: CreateProjectInput = {
      title: 'Test',
      categoryId: 'cat1',
      background: 'bg',
      description: 'desc',
      deliverables: 'del',
      acceptanceCriteria: 'ac',
      budget: 1000,
      currency: 'USD',
      deadline: new Date(),
      skillTagIds: ['s1'],
      confidentialityRequired: false,
    };
    expect(input.budget).toBe(1000);
  });

  it('ApplyProjectInput has correct fields', () => {
    const input: ApplyProjectInput = {
      projectId: 'p1',
      description: 'desc',
      approach: 'app',
      estimatedDays: 5,
      portfolioUrls: ['https://example.com'],
    };
    expect(input.estimatedDays).toBe(5);
  });

  it('SubmitWorkInput has correct fields', () => {
    const input: SubmitWorkInput = {
      projectId: 'p1',
      description: 'done',
      fileUrls: [],
    };
    expect(input.description).toBe('done');
  });

  it('SubmitReviewInput has rating constrained to 1-5', () => {
    const input: SubmitReviewInput = {
      projectId: 'p1',
      rating: 4,
      wouldCollaborateAgain: true,
    };
    expect(input.rating).toBeGreaterThanOrEqual(1);
    expect(input.rating).toBeLessThanOrEqual(5);
  });
});

// ═══════════════════════════════════════════
// Consistency: Zod schema ↔ TypeScript types
// ═══════════════════════════════════════════
describe('Type ↔ Zod schema consistency', () => {
  it('submitReviewSchema rating range matches Review/SubmitReviewInput types (1-5)', () => {
    // The types define rating as number (semantically 1-5), schema enforces 1-5
    const result1 = submitReviewSchema.safeParse({ projectId: 'p1', rating: 1, wouldCollaborateAgain: true });
    const result5 = submitReviewSchema.safeParse({ projectId: 'p1', rating: 5, wouldCollaborateAgain: true });
    expect(result1.success).toBe(true);
    expect(result5.success).toBe(true);

    const result0 = submitReviewSchema.safeParse({ projectId: 'p1', rating: 0, wouldCollaborateAgain: true });
    const result6 = submitReviewSchema.safeParse({ projectId: 'p1', rating: 6, wouldCollaborateAgain: true });
    expect(result0.success).toBe(false);
    expect(result6.success).toBe(false);
  });

  it('createProjectSchema currency matches Currency union type', () => {
    const currencies: Currency[] = ['TWD', 'USD', 'JPY', 'HKD', 'CNY'];
    for (const c of currencies) {
      const result = createProjectSchema.safeParse({
        title: 't', categoryId: 'c', background: 'b', description: 'd',
        deliverables: 'del', acceptanceCriteria: 'ac',
        budget: 100, currency: c,
        deadline: new Date(Date.now() + 86400000),
        skillTagIds: ['s1'],
        confidentialityRequired: false,
        saveAsDraft: false,
      });
      expect(result.success).toBe(true);
    }
  });

  it('submitReportSchema type enum matches Report type field', () => {
    const validTypes = ['NON_PAYMENT', 'POOR_QUALITY', 'HARASSMENT', 'SPAM', 'OTHER'];
    for (const t of validTypes) {
      const result = submitReportSchema.safeParse({
        reportedUserId: 'u1',
        type: t,
        description: 'desc',
      });
      expect(result.success).toBe(true);
    }
  });

  it('createDisputeSchema type enum matches Dispute type field', () => {
    const validTypes = ['PAYMENT_ISSUE', 'DELIVERY_QUALITY', 'SCOPE_CHANGE', 'OTHER'];
    for (const t of validTypes) {
      const result = createDisputeSchema.safeParse({
        projectId: 'p1',
        respondentId: 'u2',
        type: t,
        description: 'desc',
      });
      expect(result.success).toBe(true);
    }
  });

  it('updateDisputeSchema status enum matches DisputeStatus type', () => {
    const validStatuses: DisputeStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED'];
    for (const s of validStatuses) {
      const result = updateDisputeSchema.safeParse({ disputeId: 'd1', status: s });
      expect(result.success).toBe(true);
    }
  });

  it('completeOnboardingSchema role matches User role union type', () => {
    const roles: User['role'][] = ['CLIENT', 'FREELANCER', 'BOTH'];
    for (const r of roles) {
      const result = completeOnboardingSchema.safeParse({
        name: 'Test',
        role: r,
        skillTagIds: ['s1'],
      });
      expect(result.success).toBe(true);
    }
  });

  it('updateReviewSettingSchema reviewType matches ReviewSettingType', () => {
    const types: ReviewSettingType[] = ['USER_ONBOARDING', 'PROJECT_PUBLISH'];
    for (const t of types) {
      const result = updateReviewSettingSchema.safeParse({ reviewType: t, isEnabled: true });
      expect(result.success).toBe(true);
    }
  });

  it('handleReportSchema status matches ReportStatus (excluding PENDING)', () => {
    // PENDING is the initial state, not for resolution
    const resultPending = handleReportSchema.safeParse({ reportId: 'r1', status: 'PENDING' });
    expect(resultPending.success).toBe(false);

    const resultReview = handleReportSchema.safeParse({ reportId: 'r1', status: 'UNDER_REVIEW' });
    expect(resultReview.success).toBe(true);
  });

  it('applyProjectSchema portfolioUrls is string array (matching ApplyProjectInput)', () => {
    const result = applyProjectSchema.safeParse({
      projectId: 'p1',
      description: 'desc',
      approach: 'app',
      estimatedDays: 3,
      portfolioUrls: ['https://a.com', 'https://b.com'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.portfolioUrls)).toBe(true);
    }
  });

  it('submitWorkSchema fileUrls is string array (matching SubmitWorkInput)', () => {
    const result = submitWorkSchema.safeParse({
      projectId: 'p1',
      description: 'desc',
      fileUrls: ['https://a.com/file.pdf', 'https://b.com/file.zip'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.fileUrls)).toBe(true);
    }
  });
});
