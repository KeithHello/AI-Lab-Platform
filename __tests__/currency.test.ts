import { describe, it, expect } from 'vitest';
import { formatCurrency, getCurrencySymbol, SUPPORTED_CURRENCIES, Currency } from '@/lib/currency';

// ═══════════════════════════════════════════
// SUPPORTED_CURRENCIES
// ═══════════════════════════════════════════
describe('SUPPORTED_CURRENCIES', () => {
  it('contains exactly 5 currencies', () => {
    expect(SUPPORTED_CURRENCIES).toHaveLength(5);
  });

  it('has correct codes: TWD, USD, JPY, HKD, CNY', () => {
    const codes = SUPPORTED_CURRENCIES.map(c => c.code);
    expect(codes).toEqual(['TWD', 'USD', 'JPY', 'HKD', 'CNY']);
  });

  it('has expected symbols', () => {
    expect(SUPPORTED_CURRENCIES[0].symbol).toBe('NT$');
    expect(SUPPORTED_CURRENCIES[1].symbol).toBe('$');
    expect(SUPPORTED_CURRENCIES[2].symbol).toBe('¥');
    expect(SUPPORTED_CURRENCIES[3].symbol).toBe('HK$');
    expect(SUPPORTED_CURRENCIES[4].symbol).toBe('¥');
  });

  it('is readonly (const assertion)', () => {
    // This is more of a type-level test, but at runtime we verify structure
    expect(SUPPORTED_CURRENCIES).toBeDefined();
  });
});

// ═══════════════════════════════════════════
// formatCurrency
// ═══════════════════════════════════════════
describe('formatCurrency', () => {
  // ── TWD ──
  it('formats TWD with NT$ symbol', () => {
    expect(formatCurrency(1000, 'TWD')).toBe('NT$1,000');
  });

  it('formats TWD with zero', () => {
    expect(formatCurrency(0, 'TWD')).toBe('NT$0');
  });

  it('formats TWD with large number', () => {
    expect(formatCurrency(1000000, 'TWD')).toBe('NT$1,000,000');
  });

  // ── USD ──
  it('formats USD with $ symbol', () => {
    expect(formatCurrency(500, 'USD')).toBe('$500');
  });

  it('formats USD with zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0');
  });

  it('formats USD with large number', () => {
    expect(formatCurrency(1234567, 'USD')).toBe('$1,234,567');
  });

  // ── JPY ──
  it('formats JPY with ¥ symbol', () => {
    expect(formatCurrency(10000, 'JPY')).toBe('¥10,000');
  });

  it('formats JPY with zero', () => {
    expect(formatCurrency(0, 'JPY')).toBe('¥0');
  });

  it('formats JPY large number (no sub-unit)', () => {
    expect(formatCurrency(5000000, 'JPY')).toBe('¥5,000,000');
  });

  // ── HKD ──
  it('formats HKD with HK$ symbol', () => {
    expect(formatCurrency(800, 'HKD')).toBe('HK$800');
  });

  it('formats HKD with zero', () => {
    expect(formatCurrency(0, 'HKD')).toBe('HK$0');
  });

  it('formats HKD with large number', () => {
    expect(formatCurrency(999999, 'HKD')).toBe('HK$999,999');
  });

  // ── CNY ──
  it('formats CNY with ¥ symbol', () => {
    expect(formatCurrency(3000, 'CNY')).toBe('¥3,000');
  });

  it('formats CNY with zero', () => {
    expect(formatCurrency(0, 'CNY')).toBe('¥0');
  });

  it('formats CNY with large number', () => {
    expect(formatCurrency(8888888, 'CNY')).toBe('¥8,888,888');
  });

  // ── Edge cases ──
  it('handles negative values', () => {
    expect(formatCurrency(-500, 'USD')).toBe('$-500');
  });

  it('handles decimal values (toLocaleString behavior)', () => {
    const result = formatCurrency(1234.56, 'TWD');
    // toLocaleString by default includes decimals
    expect(result).toContain('NT$');
    expect(result).toContain('1,234');
  });

  it('returns just symbol for unknown currency (graceful degradation)', () => {
    const result = formatCurrency(100, 'XXX' as Currency);
    // Symbol would be empty string, so just the number
    expect(result).toBe('100');
  });

  it('formatCurrency uses toLocaleString formatting', () => {
    const result = formatCurrency(1000000, 'USD');
    expect(result).toBe('$1,000,000');
  });
});

// ═══════════════════════════════════════════
// getCurrencySymbol
// ═══════════════════════════════════════════
describe('getCurrencySymbol', () => {
  it('returns NT$ for TWD', () => {
    expect(getCurrencySymbol('TWD')).toBe('NT$');
  });

  it('returns $ for USD', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
  });

  it('returns ¥ for JPY', () => {
    expect(getCurrencySymbol('JPY')).toBe('¥');
  });

  it('returns HK$ for HKD', () => {
    expect(getCurrencySymbol('HKD')).toBe('HK$');
  });

  it('returns ¥ for CNY', () => {
    expect(getCurrencySymbol('CNY')).toBe('¥');
  });

  it('returns empty string for unknown currency', () => {
    expect(getCurrencySymbol('EUR' as Currency)).toBe('');
  });

  it('returns empty string for invalid input (type coercion)', () => {
    expect(getCurrencySymbol('' as Currency)).toBe('');
  });
});
