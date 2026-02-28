import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/shared/FormField';
import { Appointment, FamilyMember, NotificationChannel, NotificationSettings } from '@/types';
import { appointmentsApi, NotificationPayload } from '@/api/appointments.api';
import { membersApi } from '@/api/members.api';
import { settingsApi } from '@/api/settings.api';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'medico', label: 'Medico', color: 'bg-red-100 text-red-700' },
  { value: 'lavoro', label: 'Lavoro', color: 'bg-blue-100 text-blue-700' },
  { value: 'scuola', label: 'Scuola', color: 'bg-green-100 text-green-700' },
  { value: 'famiglia', label: 'Famiglia', color: 'bg-purple-100 text-purple-700' },
  { value: 'commissioni', label: 'Commissioni', color: 'bg-orange-100 text-orange-700' },
  { value: 'altro', label: 'Altro', color: 'bg-slate-100 text-slate-600' },
];

const MINUTES_OPTIONS = [
  { value: 15, label: '15 minuti prima' },
  { value: 30, label: '30 minuti prima' },
  { value: 60, label: '1 ora prima' },
  { value: 120, label: '2 ore prima' },
  { value: 360, label: '6 ore prima' },
  { value: 1440, label: '1 giorno prima' },
  { value: 2880, label: '2 giorni prima' },
];

interface NotificationRow {
  enabled: boolean;
  minutesBefore: number;
  channel: NotificationChannel;
  recipientPhone: string;
}

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  open: boolean;
  appointment?: Appointment;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AppointmentDialog({ open, appointment, onOpenChange, onSuccess }: Props) {
  const isEdit = !!appointment;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('altro');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memberId, setMemberId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [defaultSettings, setDefaultSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    if (!open) return;
    membersApi.getAll().then(setMembers).catch(() => {});
    settingsApi.getNotifications().then(setDefaultSettings).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (appointment) {
      setTitle(appointment.title);
      setCategory(appointment.category);
      setStartDate(toLocalDatetimeInput(appointment.startDate));
      setEndDate(toLocalDatetimeInput(appointment.endDate));
      setMemberId(appointment.memberId || '');
      setDescription(appointment.description || '');
      setNotes(appointment.notes || '');
      setNotifications(
        appointment.notifications.map((n) => ({
          enabled: true,
          minutesBefore: n.minutesBefore,
          channel: n.channel,
          recipientPhone: n.recipientPhone,
        }))
      );
    } else {
      setTitle('');
      setCategory('altro');
      setStartDate('');
      setEndDate('');
      setMemberId('');
      setDescription('');
      setNotes('');
      setNotifications([]);
    }
    setErrors({});
  }, [open, appointment]);

  const addNotification = () => {
    setNotifications((prev) => [
      ...prev,
      {
        enabled: true,
        minutesBefore: defaultSettings?.defaultMinutes ?? 60,
        channel: defaultSettings?.defaultChannel ?? 'WHATSAPP',
        recipientPhone: defaultSettings?.defaultPhone ?? '',
      },
    ]);
  };

  const removeNotification = (idx: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateNotification = (idx: number, patch: Partial<NotificationRow>) => {
    setNotifications((prev) => prev.map((n, i) => (i === idx ? { ...n, ...patch } : n)));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Il titolo è obbligatorio';
    if (!startDate) errs.startDate = 'La data di inizio è obbligatoria';
    notifications.forEach((n, i) => {
      if (n.enabled && !n.recipientPhone.trim()) {
        errs[`phone_${i}`] = 'Numero obbligatorio';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const notifs: NotificationPayload[] = notifications
        .filter((n) => n.enabled)
        .map((n) => ({
          minutesBefore: n.minutesBefore,
          channel: n.channel,
          recipientPhone: n.recipientPhone,
        }));

      const payload = {
        title: title.trim(),
        category,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        memberId: memberId || undefined,
        description: description || undefined,
        notes: notes || undefined,
        notifications: notifs,
      };

      if (isEdit && appointment) {
        await appointmentsApi.update(appointment.id, payload);
      } else {
        await appointmentsApi.create(payload);
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifica appuntamento' : 'Nuovo appuntamento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titolo */}
          <FormField label="Titolo" required error={errors.title}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Visita medica, Riunione..."
            />
          </FormField>

          {/* Categoria */}
          <FormField label="Categoria">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium mr-2', c.color)}>
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Date */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data e ora inizio" required error={errors.startDate}>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="Data e ora fine">
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormField>
          </div>

          {/* Membro */}
          <FormField label="Membro famiglia">
            <Select value={memberId || '__all__'} onValueChange={(v) => setMemberId(v === '__all__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tutta la famiglia</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Descrizione */}
          <FormField label="Descrizione">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dettagli dell'appuntamento..."
              rows={2}
            />
          </FormField>

          {/* Note */}
          <FormField label="Note">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={2}
            />
          </FormField>

          {/* Notifiche */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Notifiche</Label>
              <Button type="button" variant="outline" size="sm" onClick={addNotification}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Aggiungi
              </Button>
            </div>

            {notifications.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nessuna notifica configurata. Clicca "Aggiungi" per impostare un promemoria.
              </p>
            )}

            {notifications.map((n, idx) => (
              <div key={idx} className="border rounded-md p-3 space-y-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={n.enabled}
                      onCheckedChange={(v) => updateNotification(idx, { enabled: v })}
                    />
                    <span className="text-sm font-medium">Notifica {idx + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeNotification(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {n.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Quanto prima">
                      <Select
                        value={String(n.minutesBefore)}
                        onValueChange={(v) => updateNotification(idx, { minutesBefore: Number(v) })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MINUTES_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={String(o.value)}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Canale">
                      <Select
                        value={n.channel}
                        onValueChange={(v) => updateNotification(idx, { channel: v as NotificationChannel })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Numero destinatario"
                      error={errors[`phone_${idx}`]}
                      className="col-span-2"
                    >
                      <Input
                        className="h-8 text-xs"
                        value={n.recipientPhone}
                        onChange={(e) => updateNotification(idx, { recipientPhone: e.target.value })}
                        placeholder="+39 333 000 0000"
                      />
                    </FormField>
                  </div>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvataggio...' : isEdit ? 'Salva' : 'Crea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
