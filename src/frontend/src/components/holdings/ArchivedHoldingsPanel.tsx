import { useGetArchivedHoldings } from '../../hooks/useQueries';
import { formatCurrency, formatNumber } from '../../utils/portfolioMath';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';

export default function ArchivedHoldingsPanel() {
  const { data: archivedHoldings = [], isLoading } = useGetArchivedHoldings();

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Archived Holdings</CardTitle>
            <CardDescription>Fully sold holdings</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {archivedHoldings.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No archived holdings</p>
            <p className="text-sm text-muted-foreground mt-2">
              Holdings will appear here when fully sold
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Original Qty</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Last Sale Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedHoldings.map((holding) => {
                  const lastSale = holding.saleHistory[holding.saleHistory.length - 1];
                  const lastSaleDate = lastSale ? new Date(Number(lastSale.saleDate) / 1000000) : null;

                  return (
                    <TableRow key={holding.asset}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {holding.asset.toUpperCase()}
                          <Badge variant="secondary" className="text-xs">
                            Archived
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(holding.quantity, 8)}
                      </TableCell>
                      <TableCell className="text-right">
                        {holding.saleHistory.length} {holding.saleHistory.length === 1 ? 'sale' : 'sales'}
                      </TableCell>
                      <TableCell className="text-right">
                        {lastSaleDate ? lastSaleDate.toLocaleDateString() : '—'}
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
