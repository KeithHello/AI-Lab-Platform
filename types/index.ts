// =====================================================
// types/index.ts
// 與 Prisma Schema 保持一致的 TypeScript 型別
// =====================================================

// --- 核心領域型別（與 Prisma 模型對應） ---

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  role: 'CLIENT' | 'FREELANCER' | 'BOTH';
  canPostProjects: boolean;
  canApplyProjects: boolean;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING';
  isAdmin: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillTag {
  id: string;
  name: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reward {
  budget: number;
  currency: Currency;
}

export type Currency = 'TWD' | 'USD' | 'JPY' | 'HKD' | 'CNY';

export type ProjectStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISABLED';

export interface Project {
  id: string;
  title: string;
  categoryId: string;
  background: string;
  description: string;
  deliverables: string;
  acceptanceCriteria: string;
  budget: number;
  currency: Currency;
  deadline: Date;
  status: ProjectStatus;
  confidentialityRequired: boolean;
  references: string | null;
  clientId: string;
  selectedFreelancerId: string | null;
  revisionCount: number;
  revisionReason: string | null;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCardData {
  id: string;
  title: string;
  category: { id: string; name: string };
  skills: { id: string; name: string }[];
  budget: number;
  currency: Currency;
  deadline: Date;
  status: ProjectStatus;
  applicationCount: number;
  clientName: string;
  createdAt: Date;
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  projectId: string;
  freelancerId: string;
  description: string;
  approach: string;
  estimatedDays: number;
  portfolioUrls: string | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  projectId: string;
  freelancerId: string;
  description: string;
  demoUrl: string | null;
  githubUrl: string | null;
  documentUrl: string | null;
  fileUrls: string | null;
  createdAt: Date;
}

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  wouldCollaborateAgain: boolean;
  createdAt: Date;
}

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  projectId: string | null;
  type: string;
  description: string;
  status: ReportStatus;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';

export interface Dispute {
  id: string;
  projectId: string;
  reporterId: string;
  respondentId: string;
  type: string;
  description: string;
  respondentStatement: string | null;
  status: DisputeStatus;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewSettingType = 'USER_ONBOARDING' | 'PROJECT_PUBLISH';

export interface ReviewSetting {
  id: string;
  reviewType: ReviewSettingType;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- 收藏型別（REQ-21） ---

export interface Bookmark {
  id: string;
  userId: string;
  projectId: string;
  createdAt: Date;
}

// --- 通知型別（REQ-22） ---

export type NotificationType =
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'SUBMISSION_RECEIVED'
  | 'REVISION_REQUESTED'
  | 'PROJECT_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'PROJECT_CANCELLED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  relatedProjectId: string | null;
  createdAt: Date;
}

// --- 表單輸入型別 ---

export interface CreateProjectInput {
  title: string;
  categoryId: string;
  background: string;
  description: string;
  deliverables: string;
  acceptanceCriteria: string;
  budget: number;
  currency: Currency;
  deadline: Date;
  skillTagIds: string[];
  confidentialityRequired: boolean;
  references?: string;
  saveAsDraft?: boolean;
}

export interface ApplyProjectInput {
  projectId: string;
  description: string;
  approach: string;
  estimatedDays: number;
  portfolioUrls: string[];
}

export interface SubmitWorkInput {
  projectId: string;
  description: string;
  demoUrl?: string;
  githubUrl?: string;
  documentUrl?: string;
  fileUrls: string[];
}

export interface SubmitReviewInput {
  projectId: string;
  rating: number;
  comment?: string;
  wouldCollaborateAgain: boolean;
}

export interface SubmitReportInput {
  reportedUserId: string;
  projectId?: string;
  type: string;
  description: string;
}

// --- API 回應型別 ---

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
