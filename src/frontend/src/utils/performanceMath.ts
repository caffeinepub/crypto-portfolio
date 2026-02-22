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
}

export function calculateHoldingPerformance(
  holding: Holding,
  currentPrice: number
): HoldingPerformance {
  const currentValue = holding.currentQuantity * currentPrice;
  
  let gainLoss: number | null = null;
  let gainLossPercent: number | null = null;

  if (holding.costBasis !== undefined && holding.costBasis !== null && currentPrice > 0) {
    const costValue = holding.currentQuantity * holding.costBasis;
    gainLoss = currentValue - costValue;
    gainLossPercent = costValue > 0 ? (gainLoss / costValue) * 100 : 0;
  }

  return {
    asset: holding.asset,
    quantity: holding.currentQuantity,
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
  // Filter to only active holdings (currentQuantity > 0)
  const activeHoldings = holdings.filter(h => h.currentQuantity > 0);
  
  let totalCurrentValue = 0;
  let totalCostBasis = 0;
  let holdingsWithCostBasis = 0;

  activeHoldings.forEach(holding => {
    const price = prices[holding.asset.toUpperCase()] || 0;
    const currentValue = holding.currentQuantity * price;
    totalCurrentValue += currentValue;

    if (holding.costBasis !== undefined && holding.costBasis !== null) {
      const costValue = holding.currentQuantity * holding.costBasis;
      totalCostBasis += costValue;
      holdingsWithCostBasis++;
    }
  });

  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  return {
    totalCurrentValue,
    totalCostBasis,
    totalGainLoss,
    totalGainLossPercent,
    holdingsWithCostBasis,
  };
}

export function calculateSoldHoldingProfitLoss(holding: Holding): {
  profitLoss: number;
  profitLossPercent: number;
  isProfitable: boolean | null;
} | null {
  // For holdings with sale history, calculate profit/loss from sales
  if (holding.saleHistory.length > 0 && holding.costBasis !== undefined && holding.costBasis !== null) {
    let totalProfitLoss = 0;
    let totalCostValue = 0;

    holding.saleHistory.forEach(sale => {
      const costValue = sale.quantitySold * holding.costBasis!;
      const saleValue = sale.quantitySold * sale.salePrice;
      totalProfitLoss += (saleValue - costValue);
      totalCostValue += costValue;
    });

    const profitLossPercent = totalCostValue > 0 ? (totalProfitLoss / totalCostValue) * 100 : 0;

    return {
      profitLoss: totalProfitLoss,
      profitLossPercent,
      isProfitable: totalProfitLoss >= 0,
    };
  }

  return null;
}
