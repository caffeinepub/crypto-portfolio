import { useGetHoldings } from '../../hooks/useQueries';
import { useLivePrices } from '../../hooks/useLivePrices';
import { calculateHoldingPerformance } from '../../utils/performanceMath';
import { formatCurrency, formatPercentage } from '../../utils/portfolioMath';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export default function PerformancePanel() {
  const { data: holdings = [], isLoading: holdingsLoading } = useGetHoldings();
  
  // Filter to only active holdings (currentQuantity > 0)
  const activeHoldings = holdings.filter(h => h.currentQuantity > 0);
  
  const assets = activeHoldings.map(h => h.asset.toUpperCase());
  const { prices, isLoading: pricesLoading } = useLivePrices(assets);

  if (holdingsLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const holdingsWithCostBasis = activeHoldings.filter(
    h => h.costBasis !== undefined && h.costBasis !== null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Details</CardTitle>
        <CardDescription>Per-asset breakdown of your portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        {holdingsWithCostBasis.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Add cost basis to your holdings to see performance metrics
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Cost Basis</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdingsWithCostBasis.map((holding) => {
                  const price = prices[holding.asset.toUpperCase()] || 0;
                  const performance = calculateHoldingPerformance(holding, price);
                  const isPositive = performance.gainLoss !== null && performance.gainLoss >= 0;

                  return (
                    <TableRow key={holding.asset}>
                      <TableCell className="font-medium">
                        {holding.asset.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(holding.costBasis!)}
                      </TableCell>
                      <TableCell className="text-right">
                        {pricesLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin inline" />
                        ) : price > 0 ? (
                          formatCurrency(performance.currentValue)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {pricesLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin inline" />
                        ) : performance.gainLoss !== null ? (
                          <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span className="font-medium">
                              {formatCurrency(performance.gainLoss)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {pricesLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin inline" />
                        ) : performance.gainLossPercent !== null ? (
                          <span className={isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                            {formatPercentage(performance.gainLossPercent)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
