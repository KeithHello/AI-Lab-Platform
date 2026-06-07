'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkillTag } from '@/types';
import { Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface SkillTagInputProps {
  allTags: SkillTag[];
  selectedTagIds: string[];
  categoryId?: string;
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
  onAutoSelect?: () => Promise<string[]>;
  isAutoSelecting?: boolean;
}

function uniqueActiveTags(tags: SkillTag[]) {
  const byId = new Map<string, SkillTag>();
  const seenNames = new Set<string>();

  tags.forEach((tag) => {
    const normalizedName = tag.name.trim().toLowerCase();
    if (!tag.isActive || byId.has(tag.id) || seenNames.has(normalizedName)) return;
    byId.set(tag.id, tag);
    seenNames.add(normalizedName);
  });

  return Array.from(byId.values());
}

export default function SkillTagInput({
  allTags,
  selectedTagIds,
  categoryId,
  onChange,
  disabled,
  onAutoSelect,
  isAutoSelecting,
}: SkillTagInputProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const activeTags = useMemo(() => uniqueActiveTags(allTags), [allTags]);
  const selectedIdSet = useMemo(() => new Set(selectedTagIds), [selectedTagIds]);
  const selectedTags = activeTags.filter((tag) => selectedIdSet.has(tag.id));
  const availableTags = activeTags.filter((tag) => {
    if (selectedIdSet.has(tag.id)) return false;
    if (searchTerm && !tag.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const primaryTags = categoryId
    ? availableTags.filter((tag) => tag.categoryId === categoryId)
    : availableTags;
  const secondaryTags = categoryId
    ? availableTags.filter((tag) => tag.categoryId !== categoryId)
    : [];

  const handleToggle = (tagId: string) => {
    if (disabled) return;
    if (selectedIdSet.has(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleAutoSelect = async () => {
    if (!onAutoSelect || disabled || isAutoSelecting) return;
    const ids = await onAutoSelect();
    const validIds = new Set(activeTags.map((tag) => tag.id));
    onChange(Array.from(new Set([...selectedTagIds, ...ids.filter((id) => validIds.has(id))])));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="搜尋或輸入技能標籤..."
          disabled={disabled}
        />
        {onAutoSelect && (
          <Button type="button" variant="outline" onClick={handleAutoSelect} disabled={disabled || isAutoSelecting}>
            <Sparkles data-icon="inline-start" />
            {isAutoSelecting ? '選擇中...' : 'AI 自動選擇'}
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="default" className="cursor-pointer gap-1" onClick={() => handleToggle(tag.id)}>
              {tag.name}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {primaryTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => handleToggle(tag.id)}
          >
            + {tag.name}
          </Badge>
        ))}
        {secondaryTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => handleToggle(tag.id)}
          >
            + {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
