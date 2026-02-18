import { useState, useEffect } from 'react';
import { useAddHolding, useUpdateHolding } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Holding } from '../../backend';

interface HoldingUpsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding?: Holding;
}

export default function HoldingUpsertDialog({ open, onOpenChange, holding }: HoldingUpsertDialogProps) {
  const [asset, setAsset] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');

  const { mutate: addHolding, isPending: isAdding } = useAddHolding();
  const { mutate: updateHolding, isPending: isUpdating } = useUpdateHolding();

  const isEdit = !!holding;
  const isPending = isAdding || isUpdating;

  useEffect(() => {
    if (holding) {
      setAsset(holding.asset);
      setQuantity(holding.quantity.toString());
      setCostBasis(holding.costBasis?.toString() || '');
    } else {
      setAsset('');
      setQuantity('');
      setCostBasis('');
    }
  }, [holding, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedQuantity = parseFloat(quantity);
    const parsedCostBasis = costBasis.trim() ? parseFloat(costBasis) : null;

    if (!asset.trim() || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    if (isEdit) {
      updateHolding(
        { asset: holding.asset, quantity: parsedQuantity, costBasis: parsedCostBasis },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      addHolding(
        { asset: asset.trim().toUpperCase(), quantity: parsedQuantity, costBasis: parsedCostBasis },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Holding' : 'Add New Holding'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the quantity and cost basis for this holding.' : 'Enter the details for your new crypto holding.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset">Asset Symbol</Label>
            <Input
              id="asset"
              value={asset}
              onChange={(e) => setAsset(e.target.value.toUpperCase())}
              placeholder="BTC, ETH, SOL..."
              disabled={isEdit}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use standard symbols like BTC, ETH, SOL, ADA, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costBasis">Cost Basis (Optional)</Label>
            <Input
              id="costBasis"
              type="number"
              step="any"
              value={costBasis}
              onChange={(e) => setCostBasis(e.target.value)}
              placeholder="Total cost in USD"
            />
            <p className="text-xs text-muted-foreground">
              Total amount paid for this holding (for gain/loss calculation)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
