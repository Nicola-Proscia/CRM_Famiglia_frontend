import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/FormField';
import { renovationApi } from '@/api/renovation.api';
import { RenovationItem } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  company: z.string().optional(),
  totalPrice: z.coerce.number().min(0, 'Prezzo non valido'),
  paidAmount: z.coerce.number().min(0, 'Importo non valido'),
});

type FormData = z.infer<typeof schema>;

interface RenovationItemDialogProps {
  open: boolean;
  projectId?: string;
  item?: RenovationItem;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RenovationItemDialog({
  open,
  projectId,
  item,
  onOpenChange,
  onSuccess,
}: RenovationItemDialogProps) {
  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: item
      ? { name: item.name, company: item.company || '', totalPrice: item.totalPrice, paidAmount: item.paidAmount }
      : { name: '', company: '', totalPrice: 0, paidAmount: 0 },
  });

  const onSubmit = async (data: FormData) => {
    if (!projectId) return;
    const payload = {
      name: data.name,
      company: data.company || undefined,
      totalPrice: data.totalPrice,
      paidAmount: data.paidAmount,
    };
    if (isEdit) {
      await renovationApi.updateItem(projectId, item.id, payload);
    } else {
      await renovationApi.createItem(projectId, payload);
    }
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifica elemento' : 'Nuovo elemento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nome elemento" error={errors.name?.message} required>
            <Input placeholder="Es. Piastrelle, Sanitari, Manodopera..." {...register('name')} />
          </FormField>

          <FormField label="Azienda/Fornitore" error={errors.company?.message}>
            <Input placeholder="Es. Ceramiche Rossi" {...register('company')} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Prezzo totale (€)" error={errors.totalPrice?.message} required>
              <Input type="number" step="0.01" min="0" placeholder="0.00" {...register('totalPrice')} />
            </FormField>
            <FormField label="Importo pagato (€)" error={errors.paidAmount?.message} required>
              <Input type="number" step="0.01" min="0" placeholder="0.00" {...register('paidAmount')} />
            </FormField>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvataggio...' : isEdit ? 'Aggiorna' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
