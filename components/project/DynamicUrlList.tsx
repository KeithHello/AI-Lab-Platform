'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface DynamicUrlListProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  label?: string;
}

export default function DynamicUrlList({ urls, onChange, disabled, label = 'URL' }: DynamicUrlListProps) {
  const handleAdd = () => {
    onChange([...urls, '']);
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={`${label} #${index + 1}`}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(index)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd} disabled={disabled} className="gap-1">
        <Plus className="h-3.5 w-3.5" />
        新增 {label}
      </Button>
    </div>
  );
}
