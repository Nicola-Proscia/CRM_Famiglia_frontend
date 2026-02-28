import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, History } from 'lucide-react';
import { Expense } from '@/types';
import { expensesApi } from '@/api/expenses.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, FREQUENCY_LABELS } from '@/lib/formatters';
import { ExpenseDialog } from './ExpenseDialog';
import { ExpenseHistoryModal } from './ExpenseHistoryModal';
import { cn } from '@/lib/utils';

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

function currentMonthLabel() {
  const now = new Date();
  return `${MONTHS_IT[now.getMonth()]} ${now.getFullYear()}`;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; expense?: Expense }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; expense?: Expense }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setExpenses(await expensesApi.getAll()); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteDialog.expense) return;
    setDeleting(true);
    try {
      await expensesApi.delete(deleteDialog.expense.id);
      setDeleteDialog({ open: false });
      await load();
    } finally { setDeleting(false); }
  };

  const handleToggleActive = async (expense: Expense) => {
    await expensesApi.update(expense.id, { isActive: !expense.isActive });
    await load();
  };

  const active = expenses.filter((e) => e.isActive);
  const inactive = expenses.filter((e) => !e.isActive);
  const totalMonthly = active.reduce((sum, e) => {
    if (e.frequency === 'MONTHLY') return sum + e.amount;
    if (e.frequency === 'BIMONTHLY') return sum + e.amount / 2;
    return sum + e.amount;
  }, 0);

  const categories = [...new Set(active.map((e) => e.category))].sort();

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Spese Mensili"
        description={`${currentMonthLabel()} · ${active.length} spese attive · Totale: ${formatCurrency(totalMonthly)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setHistoryOpen(true)}>
              <History className="h-4 w-4 mr-2" />
              Storico
            </Button>
            <Button onClick={() => setDialog({ open: true })}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi spesa
            </Button>
          </div>
        }
      />

      {/* Active expenses by category */}
      {categories.map((category) => {
        const catExpenses = active.filter((e) => e.category === category);
        const catTotal = catExpenses.reduce((sum, e) => {
          if (e.frequency === 'MONTHLY') return sum + e.amount;
          if (e.frequency === 'BIMONTHLY') return sum + e.amount / 2;
          return sum + e.amount;
        }, 0);

        return (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <span className="text-sm text-muted-foreground">{formatCurrency(catTotal)}/mese</span>
            </div>
            <Card>
              <CardContent className="p-0 divide-y">
                {catExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onEdit={() => setDialog({ open: true, expense })}
                    onDelete={() => setDeleteDialog({ open: true, expense })}
                    onToggle={() => handleToggleActive(expense)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {expenses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nessuna spesa per {currentMonthLabel()}. Clicca "Aggiungi spesa" per iniziare.
          </CardContent>
        </Card>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Spese sospese ({inactive.length})
          </h3>
          <Card>
            <CardContent className="p-0 divide-y">
              {inactive.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={() => setDialog({ open: true, expense })}
                  onDelete={() => setDeleteDialog({ open: true, expense })}
                  onToggle={() => handleToggleActive(expense)}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <ExpenseDialog
        open={dialog.open}
        expense={dialog.expense}
        onOpenChange={(open) => setDialog({ open })}
        onSuccess={() => { setDialog({ open: false }); load(); }}
      />

      <ExpenseHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Elimina spesa"
        description={`Sei sicuro di voler eliminare "${deleteDialog.expense?.name}"?`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

function ExpenseRow({
  expense,
  onEdit,
  onDelete,
  onToggle,
}: {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={cn('flex items-center gap-4 px-4 py-3', !expense.isActive && 'opacity-60')}>
      <Switch checked={expense.isActive} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{expense.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-xs">
            {FREQUENCY_LABELS[expense.frequency]}
          </Badge>
          {expense.dayOfMonth && (
            <span className="text-xs text-muted-foreground">Giorno {expense.dayOfMonth}</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(expense.amount)}</p>
        {expense.frequency === 'BIMONTHLY' && (
          <p className="text-xs text-muted-foreground">
            {formatCurrency(expense.amount / 2)}/mese
          </p>
        )}
      </div>
      <div className="flex gap-1">
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
