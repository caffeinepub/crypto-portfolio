import { useGetHoldings } from '../../hooks/useQueries';
import { useLivePrices } from '../../hooks/useLivePrices';
import { calculatePortfolioPerformance } from '../../utils/performanceMath';
import { formatCurrency, formatPercentage } from '../../utils/portfolioMath';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, RefreshCw } from 'lucide-react';

export default function PortfolioSummaryCards() {
  const { data: holdings = [], isLoading: holdingsLoading } = useGetHoldings();
  
  // Filter to only active holdings (currentQuantity > 0)
  const activeHoldings = holdings.filter(h => h.currentQuantity > 0);
  
  const assets = activeHoldings.map(h => h.asset.toUpperCase());
  const { prices, isLoading: pricesLoading, isError: pricesError, hasData } = useLivePrices(assets);

  if (holdingsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const performance = calculatePortfolioPerformance(holdings, prices);
  const isPositive = performance.totalGainLoss >= 0;

  return (
    <div className="space-y-4">
      {pricesError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to fetch live prices. {hasData ? 'Showing last known prices.' : 'Please check your connection.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricesLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                formatCurrency(performance.totalCurrentValue)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeHoldings.length} active {activeHoldings.length === 1 ? 'holding' : 'holdings'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gain/Loss
            </CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {pricesLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : performance.holdingsWithCostBasis > 0 ? (
                formatCurrency(performance.totalGainLoss)
              ) : (
                <span className="text-muted-foreground text-base">No cost basis</span>
              )}
            </div>
            {performance.holdingsWithCostBasis > 0 && !pricesLoading && (
              <p className={`text-xs mt-1 ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {formatPercentage(performance.totalGainLossPercent)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost Basis
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.holdingsWithCostBasis > 0 ? (
                formatCurrency(performance.totalCostBasis)
              ) : (
                <span className="text-muted-foreground text-base">Not set</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance.holdingsWithCostBasis} of {activeHoldings.length} with cost basis
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
