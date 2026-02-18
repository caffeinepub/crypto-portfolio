import type { Holding } from '../backend';

export interface HoldingPerformance {
  asset: string;
  quantity: number;
  costBasis: number | null;
  currentPrice: number;
  currentValue: number;
  gainLoss: number | null;
  gainLossPercent: number | null;
}

export interface PortfolioPerformance {
  totalCurrentValue: number;
  totalCostBasis: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdingsWithCostBasis: number;
  holdingsWithoutCostBasis: number;
}

export function calculateHoldingPerformance(
  holding: Holding,
  currentPrice: number
): HoldingPerformance {
  const currentValue = holding.quantity * currentPrice;
  
  let gainLoss: number | null = null;
  let gainLossPercent: number | null = null;

  if (holding.costBasis !== undefined && holding.costBasis !== null) {
    gainLoss = currentValue - holding.costBasis;
    gainLossPercent = holding.costBasis > 0 ? (gainLoss / holding.costBasis) * 100 : 0;
  }

  return {
    asset: holding.asset,
    quantity: holding.quantity,
    costBasis: holding.costBasis ?? null,
    currentPrice,
    currentValue,
    gainLoss,
    gainLossPercent,
  };
}

export function calculatePortfolioPerformance(
  holdings: Holding[],
  prices: Record<string, number>
): PortfolioPerformance {
  let totalCurrentValue = 0;
  let totalCostBasis = 0;
  let holdingsWithCostBasis = 0;
  let holdingsWithoutCostBasis = 0;

  holdings.forEach(holding => {
    const price = prices[holding.asset.toUpperCase()] || 0;
    const currentValue = holding.quantity * price;
    totalCurrentValue += currentValue;

    if (holding.costBasis !== undefined && holding.costBasis !== null) {
      totalCostBasis += holding.costBasis;
      holdingsWithCostBasis++;
    } else {
      holdingsWithoutCostBasis++;
    }
  });

  const totalGainLoss = totalCostBasis > 0 ? totalCurrentValue - totalCostBasis : 0;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  return {
    totalCurrentValue,
    totalCostBasis,
    totalGainLoss,
    totalGainLossPercent,
    holdingsWithCostBasis,
    holdingsWithoutCostBasis,
  };
}
