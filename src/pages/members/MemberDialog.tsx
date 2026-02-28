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
import { FamilyMember } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  role: z.string().optional(),
  salary: z.coerce.number().min(0, 'Importo non valido'),
});

type FormData = z.infer<typeof schema>;

interface MemberDialogProps {
  open: boolean;
  member?: FamilyMember;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MemberDialog({ open, member, onOpenChange, onSuccess }: MemberDialogProps) {
  const isEdit = !!member;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: member
      ? { name: member.name, role: member.role || '', salary: member.salary }
      : { name: '', role: '', salary: 0 },
  });

  const onSubmit = async (data: FormData) => {
    if (isEdit) {
      await membersApi.update(member.id, data);
    } else {
      await membersApi.create(data);
    }
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifica membro' : 'Nuovo membro'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nome completo" error={errors.name?.message} required>
            <Input placeholder="Mario Rossi" {...register('name')} />
          </FormField>

          <FormField label="Ruolo" error={errors.role?.message}>
            <Input placeholder="Es. Capofamiglia, Coniuge..." {...register('role')} />
          </FormField>

          <FormField label="Stipendio mensile (€)" error={errors.salary?.message} required>
            <Input type="number" step="0.01" min="0" placeholder="2000" {...register('salary')} />
          </FormField>

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
