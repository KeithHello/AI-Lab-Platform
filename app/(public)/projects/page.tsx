import { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { ProjectCardData } from '@/types';
import ProjectListClient from './ProjectListClient';

export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  categoryId?: string;
  status?: string;
  page?: string;
  budgetMin?: string;
  budgetMax?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy?: string;
}

async function getCurrentListUser() {
  const { userId } = auth();
  const devUserId = process.env.NODE_ENV === 'development'
    ? cookies().get('dev_user_id')?.value
    : undefined;

  if (!devUserId && !userId) return null;

  return prisma.user.findUnique({
    where: devUserId ? { id: devUserId } : { clerkId: userId! },
    select: { id: true, canPostProjects: true },
  });
}

async function ProjectListContent({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 12;
  const search = searchParams.search || '';
  const categoryId = searchParams.categoryId || '';
  const status = searchParams.status || '';
  const budgetMin = searchParams.budgetMin || '';
  const budgetMax = searchParams.budgetMax || '';
  const deadlineFrom = searchParams.deadlineFrom || '';
  const deadlineTo = searchParams.deadlineTo || '';
  const sortBy = searchParams.sortBy || '';

  const where: Record<string, unknown> = { isApproved: true, status: { not: 'DISABLED' } };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;
  if (budgetMin || budgetMax) {
    const budgetFilter: Record<string, unknown> = {};
    if (budgetMin) budgetFilter.gte = parseFloat(budgetMin);
    if (budgetMax) budgetFilter.lte = parseFloat(budgetMax);
    where.budget = budgetFilter;
  }
  if (deadlineFrom || deadlineTo) {
    const deadlineFilter: Record<string, unknown> = {};
    if (deadlineFrom) deadlineFilter.gte = new Date(deadlineFrom);
    if (deadlineTo) deadlineFilter.lte = new Date(deadlineTo);
    where.deadline = deadlineFilter;
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' };
  switch (sortBy) {
    case 'budget_desc':
      orderBy = { budget: 'desc' };
      break;
    case 'budget_asc':
      orderBy = { budget: 'asc' };
      break;
    case 'deadline_asc':
      orderBy = { deadline: 'asc' };
      break;
    case 'deadline_desc':
      orderBy = { deadline: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  let projects: ProjectCardData[] = [];
  let total = 0;

  try {
    const [data, count] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          category: { select: { id: true, name: true } },
          projectSkills: { include: { skillTag: { select: { id: true, name: true } } } },
          client: { select: { name: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    projects = data.map((project) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      skills: project.projectSkills.map((projectSkill) => projectSkill.skillTag),
      budget: Number(project.budget),
      currency: project.currency,
      deadline: project.deadline,
      status: project.status,
      applicationCount: project._count.applications,
      clientName: project.client.name,
      createdAt: project.createdAt,
    }));
    total = count;
  } catch {
    projects = [];
    total = 0;
  }

  const [categories, currentUser] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }).catch(() => []),
    getCurrentListUser().catch(() => null),
  ]);

  let bookmarkedIds: string[] = [];
  if (currentUser) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: currentUser.id },
      select: { projectId: true },
    });
    bookmarkedIds = bookmarks.map((bookmark) => bookmark.projectId);
  }

  const paginationParams: Record<string, string> = {};
  if (search) paginationParams.search = search;
  if (categoryId) paginationParams.categoryId = categoryId;
  if (status) paginationParams.status = status;
  if (budgetMin) paginationParams.budgetMin = budgetMin;
  if (budgetMax) paginationParams.budgetMax = budgetMax;
  if (deadlineFrom) paginationParams.deadlineFrom = deadlineFrom;
  if (deadlineTo) paginationParams.deadlineTo = deadlineTo;
  if (sortBy) paginationParams.sortBy = sortBy;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          共找到 <span className="font-medium text-foreground">{total}</span> 個案件
        </p>
        {currentUser?.canPostProjects && (
          <Link href="/projects/new">
            <Button>發布案件</Button>
          </Link>
        )}
      </div>

      <ProjectListClient
        projects={projects}
        categories={categories}
        bookmarkedIds={bookmarkedIds}
        initialFilters={{
          search,
          categoryId,
          status,
          budgetMin,
          budgetMax,
          deadlineFrom,
          deadlineTo,
          sortBy,
        }}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / pageSize)}
        baseUrl="/projects"
        searchParams={paginationParams}
      />
    </div>
  );
}

export default function ProjectListPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">案件列表</h1>
        <p className="mt-2 text-muted-foreground">探索適合你的案件機會</p>
      </div>
      <Suspense fallback={<div>載入中...</div>}>
        <ProjectListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
