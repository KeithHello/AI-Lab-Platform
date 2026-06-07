// =====================================================
// lib/notifications.ts
// 通知系統工具函數（REQ-22）
// =====================================================

import { prisma } from './prisma';

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

const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; content: (params: Record<string, string>) => string }> = {
  APPLICATION_RECEIVED: {
    title: '收到新的案件申請',
    content: (p) => `${p.freelancerName} 申請了您的案件「${p.projectTitle}」`,
  },
  APPLICATION_ACCEPTED: {
    title: '您的申請已被錄取',
    content: (p) => `恭喜！您對案件「${p.projectTitle}」的申請已被發案方錄取`,
  },
  APPLICATION_REJECTED: {
    title: '申請未被錄取',
    content: (p) => `很遺憾，您對案件「${p.projectTitle}」的申請未被錄取`,
  },
  SUBMISSION_RECEIVED: {
    title: '接案者已提交成果',
    content: (p) => `${p.freelancerName} 已提交案件「${p.projectTitle}」的成果，請前往驗收`,
  },
  REVISION_REQUESTED: {
    title: '成果需要修改',
    content: (p) => `發案方要求修改案件「${p.projectTitle}」的成果`,
  },
  PROJECT_COMPLETED: {
    title: '案件已完成',
    content: (p) => `案件「${p.projectTitle}」已完成驗收，請前往評價`,
  },
  REVIEW_RECEIVED: {
    title: '收到新的評價',
    content: (p) => `您在案件「${p.projectTitle}」中收到了一則新評價`,
  },
  PROJECT_CANCELLED: {
    title: '案件已取消',
    content: (p) => `案件「${p.projectTitle}」已被取消`,
  },
  SYSTEM: {
    title: '系統通知',
    content: (p) => p.message || '您有一則新的系統通知',
  },
};

/**
 * 建立通知
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  relatedProjectId?: string;
  templateParams?: Record<string, string>;
  customTitle?: string;
  customContent?: string;
}) {
  const template = NOTIFICATION_TEMPLATES[params.type];

  const title = params.customTitle || template.title;
  const content = params.customContent || template.content(params.templateParams || {});

  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title,
      content,
      relatedProjectId: params.relatedProjectId,
    },
  });
}

/**
 * 批量建立通知（例如取消案件時通知所有申請者）
 */
export async function createBulkNotifications(
  userIds: string[],
  params: {
    type: NotificationType;
    relatedProjectId?: string;
    templateParams?: Record<string, string>;
  }
) {
  const template = NOTIFICATION_TEMPLATES[params.type];
  const title = template.title;
  const content = template.content(params.templateParams || {});

  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: params.type,
      title,
      content,
      relatedProjectId: params.relatedProjectId,
    })),
  });
}
