import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, '案件標題為必填').max(200),
  categoryId: z.string().min(1, '請選擇分類'),
  background: z.string().min(1, '案件背景為必填').max(5000),
  description: z.string().min(1, '案件敘述為必填').max(10000),
  deliverables: z.string().min(1, '交付成果為必填').max(5000),
  acceptanceCriteria: z.string().min(1, '驗收標準為必填').max(5000),
  budget: z.number().positive('預算必須大於 0'),
  currency: z.enum(['TWD', 'USD', 'JPY', 'HKD', 'CNY']),
  deadline: z.coerce.date().refine((d) => d > new Date(), '截止日期必須在未來'),
  skillTagIds: z.array(z.string()).min(1, '請選擇至少一個技能標籤'),
  confidentialityRequired: z.boolean(),
  references: z.string().optional(),
  saveAsDraft: z.boolean(),
});

export const updateProjectSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  categoryId: z.string().min(1).optional(),
  background: z.string().min(1).max(5000).optional(),
  description: z.string().min(1).max(10000).optional(),
  deliverables: z.string().min(1).max(5000).optional(),
  acceptanceCriteria: z.string().min(1).max(5000).optional(),
  budget: z.number().positive().optional(),
  currency: z.enum(['TWD', 'USD', 'JPY', 'HKD', 'CNY']).optional(),
  deadline: z.coerce.date().optional(),
  skillTagIds: z.array(z.string()).optional(),
  confidentialityRequired: z.boolean().optional(),
  references: z.string().optional(),
});

export const cancelProjectSchema = z.object({
  projectId: z.string().min(1),
  reason: z.string().min(1, '請填寫取消原因').max(2000),
});

export const disableProjectSchema = z.object({
  projectId: z.string().min(1),
});

export const applyProjectSchema = z.object({
  projectId: z.string().min(1),
  description: z.string().min(1, '請填寫申請說明').max(3000),
  approach: z.string().min(1, '請描述預計方式').max(3000),
  estimatedDays: z.number().int().positive('預計天數必須大於0'),
  portfolioUrls: z.array(z.string().url('請提供有效 URL')),
});

export const selectFreelancerSchema = z.object({
  projectId: z.string().min(1),
  freelancerId: z.string().min(1),
});

export const submitWorkSchema = z.object({
  projectId: z.string().min(1),
  description: z.string().min(1, '請填寫提交說明').max(5000),
  demoUrl: z.string().url('請提供有效 Demo URL').optional().or(z.literal('')),
  githubUrl: z.string().url('請提供有效 GitHub URL').optional().or(z.literal('')),
  documentUrl: z.string().url('請提供有效文件 URL').optional().or(z.literal('')),
  fileUrls: z.array(z.string().url('請提供有效檔案 URL')),
});

export const acceptSubmissionSchema = z.object({
  projectId: z.string().min(1),
});

export const requestRevisionSchema = z.object({
  projectId: z.string().min(1),
  reason: z.string().min(1, '請填寫修改原因').max(3000),
});

export const submitReviewSchema = z.object({
  projectId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  wouldCollaborateAgain: z.boolean(),
});

export const submitReportSchema = z.object({
  reportedUserId: z.string().min(1),
  projectId: z.string().optional(),
  type: z.enum(['NON_PAYMENT', 'POOR_QUALITY', 'HARASSMENT', 'SPAM', 'OTHER']),
  description: z.string().min(1, '請填寫舉報描述').max(3000),
});

export const handleReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'DISMISSED']),
  resolution: z.string().max(3000).optional(),
  disableUser: z.boolean().default(false),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, '分類名稱為必填').max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const deleteCategorySchema = z.object({
  categoryId: z.string().min(1),
});

export const createSkillTagSchema = z.object({
  name: z.string().min(1, '標籤名稱為必填').max(100),
  categoryId: z.string().optional(),
});

export const updateSkillTagSchema = z.object({
  skillTagId: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const deleteSkillTagSchema = z.object({
  skillTagId: z.string().min(1),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, '公告標題為必填').max(200),
  content: z.string().min(1, '公告內容為必填').max(10000),
});

export const updateAnnouncementSchema = z.object({
  announcementId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
});

export const deleteAnnouncementSchema = z.object({
  announcementId: z.string().min(1),
});

export const createDisputeSchema = z.object({
  projectId: z.string().min(1),
  respondentId: z.string().min(1).optional(),
  type: z.enum(['PAYMENT_ISSUE', 'DELIVERY_QUALITY', 'SCOPE_CHANGE', 'OTHER']),
  description: z.string().min(1, '請填寫申訴描述').max(5000),
});

export const updateDisputeSchema = z.object({
  disputeId: z.string().min(1),
  respondentStatement: z.string().max(5000).optional(),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED']),
  resolution: z.string().max(3000).optional(),
});

export const updateReviewSettingSchema = z.object({
  reviewType: z.enum(['USER_ONBOARDING', 'PROJECT_PUBLISH']),
  isEnabled: z.boolean(),
});

export const disableUserSchema = z.object({
  userId: z.string().min(1),
});

export const enableUserSchema = z.object({
  userId: z.string().min(1),
});

export const completeOnboardingSchema = z.object({
  name: z.string().min(1, '姓名為必填').max(100),
  bio: z.string().max(500).optional(),
  role: z.enum(['CLIENT', 'FREELANCER', 'BOTH']).optional(),
  canPostProjects: z.boolean().default(true),
  canApplyProjects: z.boolean().default(true),
  skillTagIds: z.array(z.string()).min(1, '請選擇至少一個技能'),
});

export const aiReviewProjectSchema = z.object({
  title: z.string().min(1).max(200),
  background: z.string().min(1).max(5000),
  description: z.string().min(1).max(10000),
  deliverables: z.string().min(1).max(5000),
  acceptanceCriteria: z.string().min(1).max(5000),
});
