import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRecordSaleMutation } from '../../hooks/useQueries';
import { formatCurrency, formatNumber } from '../../utils/portfolioMath';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Holding } from '../../backend';

interface SellDialogProps {
  holding: Holding;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SellFormData {
  quantity: string;
  salePrice: string;
}

export default function SellDialog({ holding, open, onOpenChange }: SellDialogProps) {
  const { mutate: recordSale, isPending, error } = useRecordSaleMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<SellFormData>({
    defaultValues: {
      quantity: '',
      salePrice: '',
    },
  });

  const onSubmit = (data: SellFormData) => {
    setFormError(null);
    
    const quantity = parseFloat(data.quantity);
    const salePrice = parseFloat(data.salePrice);

    recordSale(
      {
        asset: holding.asset,
        quantitySold: quantity,
        salePrice,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: (err: Error) => {
          setFormError(err.message || 'Failed to record sale');
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      if (!newOpen) {
        reset();
        setFormError(null);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell Holding</DialogTitle>
          <DialogDescription>
            Record the sale of your {holding.asset.toUpperCase()} holding
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Asset:</span>
              <span className="font-medium">{holding.asset.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Quantity:</span>
              <span className="font-medium">{formatNumber(holding.currentQuantity, 8)}</span>
            </div>
            {holding.costBasis !== undefined && holding.costBasis !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purchase Price:</span>
                <span className="font-medium">{formatCurrency(holding.costBasis)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Sell</Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              placeholder="0.00"
              disabled={isPending}
              {...register('quantity')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice">Sale Price</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              disabled={isPending}
              {...register('salePrice')}
            />
          </div>

          {(formError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError || error?.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Recording Sale...' : 'Record Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
