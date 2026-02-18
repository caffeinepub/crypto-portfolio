import { useGetHoldings } from '../../hooks/useQueries';
import { useLivePrices } from '../../hooks/useLivePrices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AllocationDonutChart from '../charts/AllocationDonutChart';

export default function PerformanceVisualizationPanel() {
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
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const allocations = holdings
    .map(holding => {
      const price = prices[holding.asset.toUpperCase()] || 0;
      const value = holding.quantity * price;
      return {
        asset: holding.asset.toUpperCase(),
        value,
      };
    })
    .filter(a => a.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalValue = allocations.reduce((sum, a) => sum + a.value, 0);

  return (
    <Card className="h-fit sticky top-20">
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>Distribution by current value</CardDescription>
      </CardHeader>
      <CardContent>
        {allocations.length === 0 || pricesLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              {pricesLoading ? 'Loading prices...' : 'No data available'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AllocationDonutChart allocations={allocations} totalValue={totalValue} />
            
            <div className="space-y-2">
              {allocations.map((allocation, index) => {
                const percentage = (allocation.value / totalValue) * 100;
                const colors = [
                  'oklch(var(--chart-1))',
                  'oklch(var(--chart-2))',
                  'oklch(var(--chart-3))',
                  'oklch(var(--chart-4))',
                  'oklch(var(--chart-5))',
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={allocation.asset} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium">{allocation.asset}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
