import { useGetAllTransactions } from '../../hooks/useQueries';
import { formatCurrency, formatNumber } from '../../utils/portfolioMath';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';

export default function TransactionHistoryPanel() {
  const { data: transactions = [], isLoading, isError, error } = useGetAllTransactions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All buy and sell transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load transactions</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All buy and sell transactions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your buy and sell transactions will appear here
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Price/Share</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => {
                  const isBuy = transaction.transactionType.__kind__ === 'buy';
                  const transactionDate = new Date(Number(transaction.date) / 1000000);

                  return (
                    <TableRow key={`${transaction.assetSymbol}-${transaction.date}-${index}`}>
                      <TableCell className="font-medium">
                        {transaction.assetSymbol.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isBuy ? 'default' : 'destructive'}
                          className={isBuy ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {isBuy ? 'Buy' : 'Sell'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(transaction.shares, 8)}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.pricePerShare !== undefined && transaction.pricePerShare !== null
                          ? formatCurrency(transaction.pricePerShare)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.totalValue)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {transactionDate.toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
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
