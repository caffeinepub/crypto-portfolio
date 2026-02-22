import { useState } from 'react';
import { useGetHoldings } from '../../hooks/useQueries';
import { useLivePrices } from '../../hooks/useLivePrices';
import { formatCurrency, formatNumber } from '../../utils/portfolioMath';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import HoldingUpsertDialog from './HoldingUpsertDialog';
import HoldingRowActions from './HoldingRowActions';
import ArchivedHoldingsPanel from './ArchivedHoldingsPanel';
import type { Holding } from '../../backend';

export default function HoldingsPanel() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: holdings = [], isLoading } = useGetHoldings();
  
  // Filter active holdings (currentQuantity > 0)
  const activeHoldings = holdings.filter(h => h.currentQuantity > 0);
  
  const assets = activeHoldings.map(h => h.asset.toUpperCase());
  const { prices, isLoading: pricesLoading } = useLivePrices(assets);

  if (isLoading) {
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

  const calculateProfitLoss = (holding: Holding) => {
    if (holding.costBasis === undefined || holding.costBasis === null) {
      return null;
    }

    const price = prices[holding.asset.toUpperCase()] || 0;
    if (price === 0) return null;

    const currentValue = holding.currentQuantity * price;
    const costValue = holding.currentQuantity * holding.costBasis;
    const profitLoss = currentValue - costValue;
    const profitLossPercent = (profitLoss / costValue) * 100;

    return {
      profitLoss,
      profitLossPercent,
      isProfitable: profitLoss >= 0,
    };
  };

  return (
    <>
      <Tabs defaultValue="active" className="w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Holdings</CardTitle>
                <CardDescription>Manage your crypto portfolio</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Holding
              </Button>
            </div>
            <TabsList className="mt-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="active" className="mt-0">
              {activeHoldings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active holdings</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Holding
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Cost Basis</TableHead>
                        <TableHead className="text-right">Profit/Loss</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeHoldings.map((holding) => {
                        const price = prices[holding.asset.toUpperCase()] || 0;
                        const value = holding.currentQuantity * price;
                        const hasCostBasis = holding.costBasis !== undefined && holding.costBasis !== null;
                        const profitLoss = calculateProfitLoss(holding);

                        return (
                          <TableRow key={holding.asset}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {holding.asset.toUpperCase()}
                                {!hasCostBasis && (
                                  <Badge variant="outline" className="text-xs">
                                    No basis
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(holding.currentQuantity, 8)}
                            </TableCell>
                            <TableCell className="text-right">
                              {pricesLoading ? (
                                <RefreshCw className="h-3 w-3 animate-spin inline" />
                              ) : price > 0 ? (
                                formatCurrency(price)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {pricesLoading ? (
                                <RefreshCw className="h-3 w-3 animate-spin inline" />
                              ) : price > 0 ? (
                                formatCurrency(value)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {hasCostBasis ? (
                                formatCurrency(holding.costBasis!)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {profitLoss && profitLoss.isProfitable !== null ? (
                                <div className={`flex items-center justify-end gap-1 ${profitLoss.isProfitable ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                                  {profitLoss.isProfitable ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  <span className="font-medium">
                                    {formatCurrency(profitLoss.profitLoss)}
                                  </span>
                                  <span className="text-xs">
                                    ({profitLoss.profitLossPercent >= 0 ? '+' : ''}{profitLoss.profitLossPercent.toFixed(2)}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <HoldingRowActions holding={holding} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="archived" className="mt-0">
              <ArchivedHoldingsPanel />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <HoldingUpsertDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
