'use client';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Category, SkillTag } from '@/types';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
}

export default function FilterGroup({
  categories,
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
}: FilterGroupProps) {
  const [showAdvanced, setShowAdvanced] = useState(
    !!(budgetMin || budgetMax || deadlineFrom || deadlineTo)
  );

  return (
    <div className="space-y-3">
      {/* Basic Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { value: '', label: '全部分類' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="w-40 cursor-pointer font-medium"
        />
        <Select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: '全部狀態' },
            { value: 'OPEN', label: '開放申請' },
            { value: 'IN_PROGRESS', label: '進行中' },
            { value: 'SUBMITTED', label: '已提交' },
            { value: 'COMPLETED', label: '已完成' },
          ]}
          className="w-40 cursor-pointer font-medium"
        />
        <Select
          value={sortBy}
          onChange={(e) => onSortByChange?.(e.target.value)}
          options={[
            { value: '', label: '預設排序' },
            { value: 'newest', label: '最新發布' },
            { value: 'budget_desc', label: '預算由高到低' },
            { value: 'budget_asc', label: '預算由低到高' },
            { value: 'deadline_asc', label: '截止日期最近' },
            { value: 'deadline_desc', label: '截止日期最遠' },
          ]}
          className="w-44 cursor-pointer font-medium"
        />
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 h-10 rounded-md border border-input bg-background cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          進階篩選
        </button>
      </div>

      {/* Advanced Filters Row */}
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-muted/30 border transition-all duration-300 ease-in-out overflow-hidden",
        showAdvanced 
          ? "max-h-[500px] p-4 border-border/60 opacity-100 mt-3" 
          : "max-h-0 p-0 border-transparent opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-bold font-mono text-muted-foreground whitespace-nowrap min-w-[64px]">預算範圍</span>
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="number"
              placeholder="最低預算"
              value={budgetMin}
              onChange={(e) => onBudgetMinChange?.(e.target.value)}
              className="w-full h-10 font-mono"
            />
            <span className="text-muted-foreground font-mono">~</span>
            <Input
              type="number"
              placeholder="最高預算"
              value={budgetMax}
              onChange={(e) => onBudgetMaxChange?.(e.target.value)}
              className="w-full h-10 font-mono"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-bold font-mono text-muted-foreground whitespace-nowrap min-w-[64px]">截止日期</span>
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="date"
              value={deadlineFrom}
              onChange={(e) => onDeadlineFromChange?.(e.target.value)}
              className="w-full h-10 cursor-pointer font-mono"
            />
            <span className="text-muted-foreground font-mono">~</span>
            <Input
              type="date"
              value={deadlineTo}
              onChange={(e) => onDeadlineToChange?.(e.target.value)}
              className="w-full h-10 cursor-pointer font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
