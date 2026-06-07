'use client';

import { useMemo, useState } from 'react';
import { Category, SkillTag } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CalendarRange, Filter, SlidersHorizontal, X } from 'lucide-react';

interface FilterGroupProps {
  categories: Category[];
  skillTags: SkillTag[];
  selectedCategoryId: string;
  selectedStatus: string;
  budgetMin?: string;
  budgetMax?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy?: string;
  onCategoryChange: (id: string) => void;
  onStatusChange: (status: string) => void;
  onBudgetMinChange?: (value: string) => void;
  onBudgetMaxChange?: (value: string) => void;
  onDeadlineFromChange?: (value: string) => void;
  onDeadlineToChange?: (value: string) => void;
  onSortByChange?: (value: string) => void;
  onResetFilters?: () => void;
  activeFiltersCount?: number;
}

const statusOptions = [
  { value: '', label: '全部狀態' },
  { value: 'OPEN', label: '開放中' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'SUBMITTED', label: '已提交' },
  { value: 'COMPLETED', label: '已完成' },
];

const sortOptions = [
  { value: '', label: '預設排序' },
  { value: 'newest', label: '最新發布' },
  { value: 'budget_desc', label: '預算高到低' },
  { value: 'budget_asc', label: '預算低到高' },
  { value: 'deadline_asc', label: '截止日最近' },
  { value: 'deadline_desc', label: '截止日最遠' },
];

function getSelectedLabel(value: string, options: { value: string; label: string }[]) {
  return options.find((option) => option.value === value)?.label ?? '';
}

export default function FilterGroup({
  categories,
  skillTags,
  selectedCategoryId,
  selectedStatus,
  budgetMin = '',
  budgetMax = '',
  deadlineFrom = '',
  deadlineTo = '',
  sortBy = '',
  onCategoryChange,
  onStatusChange,
  onBudgetMinChange,
  onBudgetMaxChange,
  onDeadlineFromChange,
  onDeadlineToChange,
  onSortByChange,
  onResetFilters,
  activeFiltersCount = 0,
}: FilterGroupProps) {
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(budgetMin || budgetMax || deadlineFrom || deadlineTo)
  );

  void skillTags;

  const categoryLabel = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId)?.name ?? '',
    [categories, selectedCategoryId]
  );

  const appliedChips = [
    categoryLabel ? { key: 'category', label: categoryLabel } : null,
    selectedStatus ? { key: 'status', label: getSelectedLabel(selectedStatus, statusOptions) } : null,
    sortBy ? { key: 'sort', label: getSelectedLabel(sortBy, sortOptions) } : null,
    budgetMin || budgetMax
      ? {
          key: 'budget',
          label: `${budgetMin || '0'} - ${budgetMax || '不限'} 元`,
        }
      : null,
    deadlineFrom || deadlineTo
      ? {
          key: 'deadline',
          label: `${deadlineFrom || '開始日'} - ${deadlineTo || '結束日'}`,
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  return (
    <section className="rounded-2xl border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">篩選條件</h2>
            <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
              用分類、狀態、排序和進階條件快速縮小案件範圍，讓列表保持乾淨，也更容易掃描。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-7 rounded-full px-3 text-[11px] font-semibold text-muted-foreground"
          >
            {activeFiltersCount > 0 ? `${activeFiltersCount} 項條件已啟用` : '尚未啟用篩選'}
          </Badge>
          {activeFiltersCount > 0 && onResetFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              清除全部
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced((value) => !value)}
            className="h-8 rounded-full px-3 text-xs shadow-none"
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            {showAdvanced ? '收合進階條件' : '進階篩選'}
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="grid gap-3 lg:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">分類</span>
            <Select
              value={selectedCategoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
              options={[
                { value: '', label: '全部分類' },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
              containerClassName="w-full"
              className="h-11 rounded-xl bg-background/95 text-sm shadow-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">狀態</span>
            <Select
              value={selectedStatus}
              onChange={(event) => onStatusChange(event.target.value)}
              options={statusOptions}
              containerClassName="w-full"
              className="h-11 rounded-xl bg-background/95 text-sm shadow-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">排序</span>
            <Select
              value={sortBy}
              onChange={(event) => onSortByChange?.(event.target.value)}
              options={sortOptions}
              containerClassName="w-full"
              className="h-11 rounded-xl bg-background/95 text-sm shadow-sm"
            />
          </label>
        </div>

        {appliedChips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {appliedChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
              >
                {chip.label}
              </Badge>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            'overflow-hidden border-t border-border/60 pt-4 transition-all duration-300 ease-out',
            showAdvanced ? 'max-h-[420px] opacity-100' : 'max-h-0 pt-0 opacity-0'
          )}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">預算區間</p>
                  <p className="text-xs text-muted-foreground">用金額上下限快速縮小更符合預期的案件。</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <Input
                  type="number"
                  placeholder="最低預算"
                  value={budgetMin}
                  onChange={(event) => onBudgetMinChange?.(event.target.value)}
                  className="h-11 rounded-xl bg-background/95 text-sm shadow-sm"
                />
                <div className="flex items-center justify-center text-xs text-muted-foreground">到</div>
                <Input
                  type="number"
                  placeholder="最高預算"
                  value={budgetMax}
                  onChange={(event) => onBudgetMaxChange?.(event.target.value)}
                  className="h-11 rounded-xl bg-background/95 text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">期限範圍</p>
                  <p className="text-xs text-muted-foreground">限定開始與截止日，適合找近期能接或快截止的案件。</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <Input
                  type="date"
                  value={deadlineFrom}
                  onChange={(event) => onDeadlineFromChange?.(event.target.value)}
                  className="h-11 rounded-xl bg-background/95 text-sm shadow-sm"
                />
                <div className="flex items-center justify-center text-xs text-muted-foreground">到</div>
                <Input
                  type="date"
                  value={deadlineTo}
                  onChange={(event) => onDeadlineToChange?.(event.target.value)}
                  className="h-11 rounded-xl bg-background/95 text-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
