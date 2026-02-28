import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { Appointment } from '@/types';
import { appointmentsApi } from '@/api/appointments.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AppointmentDialog } from './AppointmentDialog';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  medico: 'bg-red-100 text-red-700',
  lavoro: 'bg-blue-100 text-blue-700',
  scuola: 'bg-green-100 text-green-700',
  famiglia: 'bg-purple-100 text-purple-700',
  commissioni: 'bg-orange-100 text-orange-700',
  altro: 'bg-slate-100 text-slate-600',
};

const CATEGORY_LABELS: Record<string, string> = {
  medico: 'Medico',
  lavoro: 'Lavoro',
  scuola: 'Scuola',
  famiglia: 'Famiglia',
  commissioni: 'Commissioni',
  altro: 'Altro',
};

type Filter = 'all' | 'today' | 'week' | 'month';

function formatGroupLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const label = d.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const dateOnly = new Date(d);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) return `Oggi — ${label}`;
  if (dateOnly.getTime() === tomorrow.getTime()) return `Domani — ${label}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(appointments: Appointment[]): Map<string, Appointment[]> {
  const map = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const key = new Date(a.startDate).toISOString().split('T')[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return map;
}

function filterAppointments(appointments: Appointment[], filter: Filter): Appointment[] {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  switch (filter) {
    case 'today':
      return appointments.filter((a) => {
        const d = new Date(a.startDate);
        return d >= today && d <= todayEnd;
      });
    case 'week': {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return appointments.filter((a) => {
        const d = new Date(a.startDate);
        return d >= today && d <= weekEnd;
      });
    }
    case 'month': {
      const monthEnd = new Date(today);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      return appointments.filter((a) => {
        const d = new Date(a.startDate);
        return d >= today && d <= monthEnd;
      });
    }
    default:
      return appointments;
  }
}

export function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [showPast, setShowPast] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; appointment?: Appointment }>({
    open: false,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    appointment?: Appointment;
  }>({ open: false });
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.appointment) return;
    setDeleting(true);
    try {
      await appointmentsApi.remove(deleteDialog.appointment.id);
      setDeleteDialog({ open: false });
      await load();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.startDate) >= now);
  const past = appointments.filter((a) => new Date(a.startDate) < now);

  const filteredUpcoming = filterAppointments(upcoming, filter);
  const groupedUpcoming = groupByDate(filteredUpcoming);

  return (
    <div>
      <PageHeader
        title="Agenda"
        description={`${upcoming.length} prossimi appuntamenti`}
        actions={
          <Button onClick={() => setDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo appuntamento
          </Button>
        }
      />

      {/* Filtri rapidi */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            { key: 'all', label: 'Tutti' },
            { key: 'today', label: 'Oggi' },
            { key: 'week', label: 'Questa settimana' },
            { key: 'month', label: 'Questo mese' },
          ] as { key: Filter; label: string }[]
        ).map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Prossimi appuntamenti */}
      {filteredUpcoming.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nessun appuntamento trovato per questo periodo.
          </CardContent>
        </Card>
      ) : (
        Array.from(groupedUpcoming.entries()).map(([dateKey, items]) => (
          <div key={dateKey} className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {formatGroupLabel(dateKey)}
            </h3>
            <Card>
              <CardContent className="p-0 divide-y">
                {items.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    onEdit={() => setDialog({ open: true, appointment: a })}
                    onDelete={() => setDeleteDialog({ open: true, appointment: a })}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        ))
      )}

      {/* Appuntamenti passati (collassabili) */}
      {past.length > 0 && (
        <div className="mt-8">
          <button
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
            onClick={() => setShowPast((v) => !v)}
          >
            {showPast ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Passati ({past.length})
          </button>

          {showPast && (
            <Card>
              <CardContent className="p-0 divide-y">
                {past.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    past
                    onEdit={() => setDialog({ open: true, appointment: a })}
                    onDelete={() => setDeleteDialog({ open: true, appointment: a })}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <AppointmentDialog
        open={dialog.open}
        appointment={dialog.appointment}
        onOpenChange={(open) => setDialog({ open })}
        onSuccess={() => {
          setDialog({ open: false });
          load();
        }}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Elimina appuntamento"
        description={`Sei sicuro di voler eliminare "${deleteDialog.appointment?.title}"?`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

function AppointmentRow({
  appointment: a,
  past = false,
  onEdit,
  onDelete,
}: {
  appointment: Appointment;
  past?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const catColor = CATEGORY_COLORS[a.category] ?? CATEGORY_COLORS.altro;
  const catLabel = CATEGORY_LABELS[a.category] ?? a.category;
  const hasNotifications = a.notifications.length > 0;

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', past && 'opacity-60')}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn('text-xs font-medium border-0', catColor)}>{catLabel}</Badge>
          <span className="font-medium text-sm">{a.title}</span>
          {hasNotifications && (
            <Bell className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          <span>{formatTime(a.startDate)}</span>
          {a.endDate && <span>→ {formatTime(a.endDate)}</span>}
          {a.member && <span>· {a.member.name}</span>}
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
