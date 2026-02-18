import { useState } from 'react';
import { useGetHoldings } from '../../hooks/useQueries';
import { useLivePrices } from '../../hooks/useLivePrices';
import { formatCurrency, formatNumber } from '../../utils/portfolioMath';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw } from 'lucide-react';
import HoldingUpsertDialog from './HoldingUpsertDialog';
import HoldingRowActions from './HoldingRowActions';

export default function HoldingsPanel() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No holdings yet</p>
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
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((holding) => {
                    const price = prices[holding.asset.toUpperCase()] || 0;
                    const value = holding.quantity * price;
                    const hasCostBasis = holding.costBasis !== undefined && holding.costBasis !== null;

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
                          {formatNumber(holding.quantity, 8)}
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
        </CardContent>
      </Card>

      <HoldingUpsertDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
