'use client';

import { useEffect, useRef, useState } from 'react';
import { Category, ProjectCardData } from '@/types';
import { useFilterParams } from '@/hooks/useFilterParams';
import SearchBar from '@/components/project/SearchBar';
import FilterGroup from '@/components/project/FilterGroup';
import ProjectCard from '@/components/project/ProjectCard';
import { Badge } from '@/components/ui/badge';

interface ProjectListClientProps {
  projects: ProjectCardData[];
  categories: Category[];
  bookmarkedIds: string[];
  totalCount: number;
  initialFilters: {
    search: string;
    categoryId: string;
    status: string;
    budgetMin: string;
    budgetMax: string;
    deadlineFrom: string;
    deadlineTo: string;
    sortBy: string;
  };
}

export default function ProjectListClient({
  projects,
  categories,
  bookmarkedIds,
  totalCount,
  initialFilters,
}: ProjectListClientProps) {
  const { setParams } = useFilterParams();
  const [searchValue, setSearchValue] = useState(initialFilters.search);
  const didMountRef = useRef(false);

  const activeFiltersCount = [
    initialFilters.search,
    initialFilters.categoryId,
    initialFilters.status,
    initialFilters.budgetMin,
    initialFilters.budgetMax,
    initialFilters.deadlineFrom,
    initialFilters.deadlineTo,
    initialFilters.sortBy,
  ].filter(Boolean).length;

  useEffect(() => {
    setSearchValue(initialFilters.search);
  }, [initialFilters.search]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      setParams({ search: searchValue }, { replace: true });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchValue, setParams]);

  const clearSearch = () => {
    setSearchValue('');
    setParams({ search: '' }, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchValue('');
    setParams(
      {
        search: '',
        categoryId: '',
        status: '',
        budgetMin: '',
        budgetMax: '',
        deadlineFrom: '',
        deadlineTo: '',
        sortBy: '',
      },
      { replace: true }
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">尋找適合的案件</p>
            <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
              關鍵字搜尋會同步寫入網址，篩選條件也會一起保留，方便你回來接著看。
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="rounded-full border-border/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                {totalCount} 個案件
              </Badge>
              <Badge
                variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
                className="rounded-full border-border/70 px-3 py-1 text-[11px] font-semibold"
              >
                {activeFiltersCount > 0 ? `${activeFiltersCount} 項條件啟用中` : '尚未啟用篩選'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onClear={clearSearch}
            placeholder="搜尋案件名稱或描述..."
          />
        </div>
      </div>

      <FilterGroup
        categories={categories}
        skillTags={[]}
        selectedCategoryId={initialFilters.categoryId}
        selectedStatus={initialFilters.status}
        budgetMin={initialFilters.budgetMin}
        budgetMax={initialFilters.budgetMax}
        deadlineFrom={initialFilters.deadlineFrom}
        deadlineTo={initialFilters.deadlineTo}
        sortBy={initialFilters.sortBy}
        activeFiltersCount={activeFiltersCount}
        onCategoryChange={(id) => setParams({ categoryId: id }, { replace: true })}
        onStatusChange={(status) => setParams({ status }, { replace: true })}
        onBudgetMinChange={(value) => setParams({ budgetMin: value }, { replace: true })}
        onBudgetMaxChange={(value) => setParams({ budgetMax: value }, { replace: true })}
        onDeadlineFromChange={(value) => setParams({ deadlineFrom: value }, { replace: true })}
        onDeadlineToChange={(value) => setParams({ deadlineTo: value }, { replace: true })}
        onSortByChange={(value) => setParams({ sortBy: value }, { replace: true })}
        onResetFilters={clearAllFilters}
      />

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isBookmarked={bookmarkedIds.includes(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">沒有符合條件的案件</p>
          <p className="mt-2 text-sm text-muted-foreground">
            可以試試放寬分類、狀態或預算範圍，讓結果回來一些。
          </p>
        </div>
      )}
    </div>
  );
}
