import { useGetHoldings } from '../../hooks/useQueries';
import { useLivePrices } from '../../hooks/useLivePrices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AllocationDonutChart from '../charts/AllocationDonutChart';

export default function PerformanceVisualizationPanel() {
  const { data: holdings = [], isLoading: holdingsLoading } = useGetHoldings();
  
  // Filter to only active holdings (currentQuantity > 0)
  const activeHoldings = holdings.filter(h => h.currentQuantity > 0);
  
  const assets = activeHoldings.map(h => h.asset.toUpperCase());
  const { prices, isLoading: pricesLoading } = useLivePrices(assets);

  if (holdingsLoading) {
    return (
      <Card className="lg:sticky lg:top-4">
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-muted animate-pulse rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const allocationData = activeHoldings
    .map(holding => {
      const price = prices[holding.asset.toUpperCase()] || 0;
      const value = holding.currentQuantity * price;
      return {
        asset: holding.asset.toUpperCase(),
        value,
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>Distribution by current value</CardDescription>
      </CardHeader>
      <CardContent>
        {allocationData.length === 0 || pricesLoading ? (
          <div className="aspect-square flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {pricesLoading ? 'Loading prices...' : 'No data available'}
            </p>
          </div>
        ) : (
          <AllocationDonutChart allocations={allocationData} totalValue={totalValue} />
        )}
      </CardContent>
    </Card>
  );
}
