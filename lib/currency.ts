export type Currency = 'TWD' | 'USD' | 'JPY' | 'HKD' | 'CNY';

export const SUPPORTED_CURRENCIES = [
  { code: 'TWD', symbol: 'NT$', name: '新台幣' },
  { code: 'USD', symbol: '$', name: '美元' },
  { code: 'JPY', symbol: '¥', name: '日圓' },
  { code: 'HKD', symbol: 'HK$', name: '港幣' },
  { code: 'CNY', symbol: '¥', name: '人民幣' },
] as const;

export function formatCurrency(amount: number, currency: Currency): string {
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  const symbol = config?.symbol ?? '';
  return `${symbol}${amount.toLocaleString()}`;
}

export function getCurrencySymbol(currency: Currency): string {
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  return config?.symbol ?? '';
}
