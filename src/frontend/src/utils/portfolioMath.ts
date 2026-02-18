import type { Holding } from '../backend';

export function calculateCurrentValue(quantity: number, price: number): number {
  return quantity * price;
}

export function calculateTotalPortfolioValue(
  holdings: Holding[],
  prices: Record<string, number>
): number {
  return holdings.reduce((total, holding) => {
    const price = prices[holding.asset.toUpperCase()] || 0;
    return total + calculateCurrentValue(holding.quantity, price);
  }, 0);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 8): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  }).format(value / 100);
}
