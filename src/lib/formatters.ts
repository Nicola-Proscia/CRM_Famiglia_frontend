const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(dateString: string): string {
  return dateFormatter.format(new Date(dateString));
}

export function formatDateInput(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}

export const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: 'Mensile',
  BIMONTHLY: 'Bimestrale',
  CUSTOM: 'Personalizzata',
};

export const RENOVATION_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Pianificato',
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completato',
  ON_HOLD: 'Sospeso',
};

export const RENOVATION_STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-gray-100 text-gray-700',
};

export const EXPENSE_CATEGORIES = [
  'Casa',
  'Alimentari',
  'Utenze',
  'Trasporti',
  'Salute',
  'Istruzione',
  'Benessere',
  'Intrattenimento',
  'Abbigliamento',
  'Altro',
];
