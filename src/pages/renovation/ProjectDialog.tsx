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
import { renovationApi } from '@/api/renovation.api';
import { RenovationProject, RenovationStatus } from '@/types';
import { RENOVATION_STATUS_LABELS } from '@/lib/formatters';

const schema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  company: z.string().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProjectDialogProps {
  open: boolean;
  project?: RenovationProject;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProjectDialog({ open, project, onOpenChange, onSuccess }: ProjectDialogProps) {
  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: project
      ? {
          name: project.name,
          company: project.company || '',
          status: project.status,
          startDate: project.startDate ? project.startDate.split('T')[0] : '',
          endDate: project.endDate ? project.endDate.split('T')[0] : '',
        }
      : { name: '', company: '', status: 'PLANNED', startDate: '', endDate: '' },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      company: data.company || undefined,
      status: data.status as RenovationStatus,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
    };
    if (isEdit) {
      await renovationApi.updateProject(project.id, payload);
    } else {
      await renovationApi.createProject(payload);
    }
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifica progetto' : 'Nuovo progetto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nome progetto" error={errors.name?.message} required>
            <Input placeholder="Es. Ristrutturazione bagno" {...register('name')} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Azienda/Impresa" error={errors.company?.message}>
              <Input placeholder="Es. Impresa Bianchi" {...register('company')} />
            </FormField>

            <FormField label="Stato" error={errors.status?.message} required>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RENOVATION_STATUS_LABELS).map(([value, label]) => (
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

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data inizio" error={errors.startDate?.message}>
              <Input type="date" {...register('startDate')} />
            </FormField>
            <FormField label="Data fine" error={errors.endDate?.message}>
              <Input type="date" {...register('endDate')} />
            </FormField>
          </div>

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
