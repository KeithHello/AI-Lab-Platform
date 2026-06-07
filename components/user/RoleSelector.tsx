'use client';

interface RoleSelectorProps {
  value: 'CLIENT' | 'FREELANCER' | 'BOTH';
  onChange: (role: 'CLIENT' | 'FREELANCER' | 'BOTH') => void;
  disabled?: boolean;
}

export default function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(['CLIENT', 'FREELANCER', 'BOTH'] as const).map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 text-center transition-colors ${
            value === role
              ? 'border-primary bg-primary/5'
              : 'border-muted hover:border-muted-foreground'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <p className="font-medium">
            {role === 'CLIENT' ? '發案方' : role === 'FREELANCER' ? '接案者' : '兩者皆是'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {role === 'CLIENT' ? '發布案件' : role === 'FREELANCER' ? '承接案件' : '雙向參與'}
          </p>
        </button>
      ))}
    </div>
  );
}
