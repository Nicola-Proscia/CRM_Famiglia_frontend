import React, { useEffect, useState } from 'react';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { expensesApi, HistoryMonth } from '@/api/expenses.api';
import { Expense } from '@/types';
import { formatCurrency, FREQUENCY_LABELS } from '@/lib/formatters';

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseHistoryModal({ open, onOpenChange }: Props) {
  const [months, setMonths] = useState<HistoryMonth[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingMonths(true);
    expensesApi
      .getHistoryMonths()
      .then((data) => {
        setMonths(data);
        setSelectedIndex(0);
      })
      .finally(() => setLoadingMonths(false));
  }, [open]);

  const selected = months[selectedIndex];

  useEffect(() => {
    if (!selected) { setExpenses([]); return; }
    setLoadingExpenses(true);
    expensesApi
      .getHistoryExpenses(selected.month, selected.year)
      .then(setExpenses)
      .finally(() => setLoadingExpenses(false));
  }, [selected?.month, selected?.year]);

  const categories = [...new Set(expenses.map((e) => e.category))].sort();
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Storico Spese
          </DialogTitle>
        </DialogHeader>

        {loadingMonths ? (
          <p className="text-center text-muted-foreground py-10">Caricamento...</p>
        ) : months.length === 0 ? (
          <div className="text-center py-10">
            <History className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">
              Nessuna spesa archiviata nei mesi precedenti.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Le spese personalizzate vengono archiviate automaticamente ogni 1° del mese.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Month navigator */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={selectedIndex >= months.length - 1}
                onClick={() => setSelectedIndex((i) => i + 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <p className="font-semibold text-sm">
                  {selected ? `${MONTHS_IT[selected.month - 1]} ${selected.year}` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedIndex + 1} di {months.length} mesi archiviati
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={selectedIndex <= 0}
                onClick={() => setSelectedIndex((i) => i - 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Summary row */}
            {selected && !loadingExpenses && (
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-muted-foreground">
                  {selected.count} {selected.count === 1 ? 'voce' : 'voci'}
                </span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
            )}

            {/* Expenses list */}
            {loadingExpenses ? (
              <p className="text-center text-muted-foreground py-6 text-sm">Caricamento...</p>
            ) : expenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                Nessuna spesa in questo mese.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const catExp = expenses.filter((e) => e.category === cat);
                  const catTotal = catExp.reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {cat}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(catTotal)}
                        </span>
                      </div>
                      <Card>
                        <CardContent className="p-0 divide-y">
                          {catExp.map((e) => (
                            <div
                              key={e.id}
                              className="flex items-center justify-between px-3 py-2.5"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{e.name}</p>
                                <Badge variant="outline" className="text-xs mt-0.5">
                                  {FREQUENCY_LABELS[e.frequency]}
                                </Badge>
                              </div>
                              <span className="font-semibold text-sm ml-3 shrink-0">
                                {formatCurrency(e.amount)}
                              </span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Month dots */}
            {months.length > 1 && (
              <div className="flex justify-center gap-1.5 pt-1">
                {months.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === selectedIndex
                        ? 'w-4 bg-primary'
                        : 'w-1.5 bg-muted-foreground/30'
                    }`}
                  />
                ))}
                {months.length > 8 && (
                  <span className="text-xs text-muted-foreground self-center">…</span>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
