import { useGetHoldings } from '../../hooks/useQueries';
import { useLivePrices } from '../../hooks/useLivePrices';
import { calculateHoldingPerformance } from '../../utils/performanceMath';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/portfolioMath';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PerformancePanel() {
  const { data: holdings = [], isLoading } = useGetHoldings();
  const assets = holdings.map(h => h.asset.toUpperCase());
  const { prices, isLoading: pricesLoading } = useLivePrices(assets);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const holdingsWithPerformance = holdings
    .map(holding => {
      const price = prices[holding.asset.toUpperCase()] || 0;
      return calculateHoldingPerformance(holding, price);
    })
    .filter(h => h.costBasis !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Details</CardTitle>
        <CardDescription>Gain/loss breakdown by asset</CardDescription>
      </CardHeader>
      <CardContent>
        {holdingsWithPerformance.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Add cost basis to your holdings to track performance
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost Basis</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdingsWithPerformance.map((perf) => {
                  const isPositive = (perf.gainLoss || 0) >= 0;
                  
                  return (
                    <TableRow key={perf.asset}>
                      <TableCell className="font-medium">
                        {perf.asset.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(perf.quantity, 8)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(perf.costBasis!)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {pricesLoading ? '...' : formatCurrency(perf.currentValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {pricesLoading ? '...' : formatCurrency(perf.gainLoss!)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={isPositive ? 'default' : 'destructive'} className="font-mono">
                          {pricesLoading ? '...' : formatPercentage(perf.gainLossPercent!)}
                        </Badge>
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
