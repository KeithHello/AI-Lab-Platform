'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Currency } from '@/lib/currency';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

interface BudgetInputProps {
  amount: number;
  currency: Currency;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: Currency) => void;
  disabled?: boolean;
}

export default function BudgetInput({ amount, currency, onAmountChange, onCurrencyChange, disabled }: BudgetInputProps) {
  return (
    <div className="flex gap-2">
      <Select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        options={SUPPORTED_CURRENCIES.map((c) => ({
          value: c.code,
          label: `${c.symbol} ${c.name}`,
        }))}
        className="w-40"
        disabled={disabled}
      />
      <Input
        type="number"
        value={amount || ''}
        onChange={(e) => onAmountChange(Number(e.target.value))}
        placeholder="預算金額"
        disabled={disabled}
        min={0}
      />
    </div>
  );
}
