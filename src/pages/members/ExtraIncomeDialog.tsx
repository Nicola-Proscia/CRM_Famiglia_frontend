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
import { membersApi } from '@/api/members.api';
import { ExtraIncome } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Descrizione obbligatoria'),
  amount: z.coerce.number().min(0, 'Importo non valido'),
});

type FormData = z.infer<typeof schema>;

interface ExtraIncomeDialogProps {
  open: boolean;
  memberId?: string;
  income?: ExtraIncome;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExtraIncomeDialog({
  open,
  memberId,
  income,
  onOpenChange,
  onSuccess,
}: ExtraIncomeDialogProps) {
  const isEdit = !!income;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: income
      ? { name: income.name, amount: income.amount }
      : { name: '', amount: 0 },
  });

  const onSubmit = async (data: FormData) => {
    if (!memberId) return;
    if (isEdit) {
      await membersApi.updateExtraIncome(memberId, income.id, data);
    } else {
      await membersApi.addExtraIncome(memberId, data);
    }
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifica entrata extra' : 'Nuova entrata extra'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Descrizione" error={errors.name?.message} required>
            <Input placeholder="Es. Affitto garage, Consulenze..." {...register('name')} />
          </FormField>

          <FormField label="Importo mensile (€)" error={errors.amount?.message} required>
            <Input type="number" step="0.01" min="0" placeholder="200" {...register('amount')} />
          </FormField>

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
