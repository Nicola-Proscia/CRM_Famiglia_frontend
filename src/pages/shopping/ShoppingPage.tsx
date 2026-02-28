import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ShoppingCart, CheckCircle2, Circle, X } from 'lucide-react';
import { expensesApi } from '@/api/expenses.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/* ── Types ── */
interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
}

interface StoredList {
  items: ShoppingItem[];
  date: string; // yyyy-mm-dd — lista viene resettata se cambia il giorno
}

/* ── Helpers ── */
const STORAGE_KEY = 'crm_shopping_list';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadFromStorage(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored: StoredList = JSON.parse(raw);
    if (stored.date !== todayKey()) return []; // nuovo giorno → lista vuota
    return stored.items;
  } catch {
    return [];
  }
}

function saveToStorage(items: ShoppingItem[]) {
  const stored: StoredList = { items, date: todayKey() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatDateIT(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ── Component ── */
export function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>(loadFromStorage);
  const [newText, setNewText] = useState('');
  const [completeDialog, setCompleteDialog] = useState(false);
  const [totalInput, setTotalInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Persisti ogni cambiamento */
  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  /* ── Aggiunta voce ── */
  const addItem = () => {
    const text = newText.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: uid(), text, checked: false }]);
    setNewText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addItem();
  };

  /* ── Toggle checkbox ── */
  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  /* ── Rimuovi voce ── */
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* ── Svuota tutto ── */
  const clearAll = () => {
    setItems([]);
  };

  /* ── Completa spesa ── */
  const handleComplete = async () => {
    const amount = parseFloat(totalInput.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    setSaving(true);
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const dateLabel = today.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const name = noteInput.trim()
        ? `Spesa del ${dateLabel} — ${noteInput.trim()}`
        : `Spesa del ${dateLabel}`;

      await expensesApi.create({
        name,
        amount,
        frequency: 'CUSTOM',
        category: 'spesa',
        date: dateStr,
        isActive: true,
      });

      /* Rimuovi solo gli acquistati (spuntati), mantieni quelli non ancora presi */
      setItems((prev) => prev.filter((item) => !item.checked));
      setTotalInput('');
      setNoteInput('');
      setCompleteDialog(false);
      setSuccessMsg(`Spesa di €${amount.toFixed(2)} aggiunta correttamente!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const uncheckedCount = items.length - checkedCount;

  return (
    <div>
      <PageHeader
        title="Spesa giornaliera"
        description={formatDateIT(new Date())}
        actions={
          items.length > 0 ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-1" />
                Svuota
              </Button>
              <Button onClick={() => setCompleteDialog(true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completa spesa
              </Button>
            </div>
          ) : null
        }
      />

      {/* Messaggio successo */}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Input aggiunta prodotto */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Aggiungi prodotto..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={addItem} disabled={!newText.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista prodotti */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">
              La lista è vuota. Aggiungi i prodotti da acquistare.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {/* Prima i non spuntati, poi gli spuntati */}
            {[...items.filter((i) => !i.checked), ...items.filter((i) => i.checked)].map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  item.checked && 'bg-muted/40'
                )}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={item.checked ? 'Deseleziona' : 'Seleziona'}
                >
                  {item.checked ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>

                <span
                  className={cn(
                    'flex-1 text-sm',
                    item.checked && 'line-through text-muted-foreground'
                  )}
                >
                  {item.text}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Rimuovi"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contatore */}
      {items.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground text-right">
          {uncheckedCount > 0
            ? `${uncheckedCount} da acquistare · ${checkedCount} acquistati`
            : `Tutti i ${checkedCount} prodotti acquistati`}
        </p>
      )}

      {/* Dialog: Completa spesa */}
      <Dialog open={completeDialog} onOpenChange={setCompleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Completa spesa</DialogTitle>
            <DialogDescription>
              {items.length} prodotti in lista ({checkedCount} acquistati).
              Inserisci il totale speso per aggiungere questa voce alle spese.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Totale speso (€) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={totalInput}
                onChange={(e) => setTotalInput(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Note (opzionale)</label>
              <Input
                placeholder="es. Esselunga, spesa settimanale..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCompleteDialog(false)}
              disabled={saving}
            >
              Annulla
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!totalInput || parseFloat(totalInput.replace(',', '.')) <= 0 || saving}
            >
              {saving ? 'Salvataggio...' : 'Aggiungi alle spese'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
