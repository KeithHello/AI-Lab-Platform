'use client';

import { Category, ProjectCardData } from '@/types';
import { useFilterParams } from '@/hooks/useFilterParams';
import SearchBar from '@/components/project/SearchBar';
import FilterGroup from '@/components/project/FilterGroup';
import ProjectCard from '@/components/project/ProjectCard';
import { useCallback, useState } from 'react';

interface ProjectListClientProps {
  projects: ProjectCardData[];
  categories: Category[];
  bookmarkedIds: string[];
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
  initialFilters,
}: ProjectListClientProps) {
  const { setParams } = useFilterParams();
  const [searchValue, setSearchValue] = useState(initialFilters.search);

  // Debounce search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      // Use a timeout for debounced search
      const timer = setTimeout(() => {
        setParams({ search: value });
      }, 500);
      return () => clearTimeout(timer);
    },
    [setParams]
  );

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-sm space-y-4">
        <SearchBar
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="搜尋案件名稱或描述..."
        />

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
          onCategoryChange={(id) => setParams({ categoryId: id })}
          onStatusChange={(status) => setParams({ status })}
          onBudgetMinChange={(v) => setParams({ budgetMin: v })}
          onBudgetMaxChange={(v) => setParams({ budgetMax: v })}
          onDeadlineFromChange={(v) => setParams({ deadlineFrom: v })}
          onDeadlineToChange={(v) => setParams({ deadlineTo: v })}
          onSortByChange={(v) => setParams({ sortBy: v })}
        />
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isBookmarked={bookmarkedIds.includes(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-dashed rounded-2xl">
          <p className="text-muted-foreground font-medium">沒有找到符合條件的案件</p>
        </div>
      )}
    </div>
  );
}
