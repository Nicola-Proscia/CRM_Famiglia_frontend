import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/shared/FormField';
import { expensesApi } from '@/api/expenses.api';
import { Expense, ExpenseFrequency } from '@/types';
import { EXPENSE_CATEGORIES, FREQUENCY_LABELS } from '@/lib/formatters';

const schema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  amount: z.coerce.number().min(0, 'Importo non valido'),
  frequency: z.enum(['MONTHLY', 'BIMONTHLY', 'CUSTOM']),
  category: z.string().min(1, 'Categoria obbligatoria'),
  dayOfMonth: z.coerce.number().min(1).max(31).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface ExpenseDialogProps {
  open: boolean;
  expense?: Expense;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExpenseDialog({ open, expense, onOpenChange, onSuccess }: ExpenseDialogProps) {
  const isEdit = !!expense;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: expense
      ? {
          name: expense.name,
          amount: expense.amount,
          frequency: expense.frequency,
          category: expense.category,
          dayOfMonth: expense.dayOfMonth || '',
        }
      : { name: '', amount: 0, frequency: 'MONTHLY', category: '', dayOfMonth: '' },
  });

  const frequency = watch('frequency');

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      amount: data.amount,
      frequency: data.frequency as ExpenseFrequency,
      category: data.category,
      dayOfMonth: data.dayOfMonth ? Number(data.dayOfMonth) : undefined,
    };
    if (isEdit) {
      await expensesApi.update(expense.id, payload);
    } else {
      await expensesApi.create(payload);
    }
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifica spesa' : 'Nuova spesa'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nome spesa" error={errors.name?.message} required>
            <Input placeholder="Es. Mutuo, Spesa alimentare..." {...register('name')} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Importo (€)" error={errors.amount?.message} required>
              <Input type="number" step="0.01" min="0" placeholder="0.00" {...register('amount')} />
            </FormField>

            <FormField label="Frequenza" error={errors.frequency?.message} required>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField label="Categoria" error={errors.category?.message} required>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {frequency === 'MONTHLY' && (
            <FormField
              label="Giorno del mese"
              error={errors.dayOfMonth?.message?.toString()}
            >
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="Es. 5 (per il 5 del mese)"
                {...register('dayOfMonth')}
              />
            </FormField>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvataggio...' : isEdit ? 'Aggiorna' : 'Crea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
