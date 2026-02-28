import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, HardHat, Wallet } from 'lucide-react';
import { dashboardApi } from '@/api/dashboard.api';
import { DashboardSummary, TrendPoint } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendChart } from '@/components/charts/TrendChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { formatCurrency } from '@/lib/formatters';

function getCurrentMonthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${lastDay}`,
  };
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { from: defaultFrom, to: defaultTo } = getCurrentMonthRange();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        dashboardApi.getSummary(from, to),
        dashboardApi.getTrend(from, to, 'month'),
      ]);
      setSummary(s);
      setTrend(t.trend);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader />;
  if (!summary) return null;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Panoramica finanziaria familiare"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-36"
            />
            <span className="text-muted-foreground text-sm">→</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-36"
            />
            <Button onClick={load} size="sm" className="shrink-0">
              Aggiorna
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Entrate totali"
          value={formatCurrency(summary.income.total)}
          subtitle={`${summary.income.memberCount} membri`}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Stipendi"
          value={formatCurrency(summary.income.totalSalaries)}
          subtitle="mensili"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Entrate extra"
          value={formatCurrency(summary.income.totalExtraIncomes)}
          subtitle="mensili"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          title="Spese mensili"
          value={formatCurrency(summary.expenses.totalMonthly)}
          subtitle={`${summary.expenses.count} voci`}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          title="Saldo netto"
          value={formatCurrency(summary.balance)}
          subtitle="entrate - spese"
          className={summary.balance >= 0 ? 'border-green-200' : 'border-red-200'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Andamento mensile</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <TrendChart data={trend} />
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">
                Nessun dato disponibile per il periodo selezionato.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spese per categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.expenses.byCategory.length > 0 ? (
              <CategoryPieChart data={summary.expenses.byCategory} />
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">
                Nessuna spesa registrata.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renovation summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riepilogo ristrutturazione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(summary.renovation.totalCost)}</p>
              <p className="text-sm text-muted-foreground mt-1">Costo totale</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.renovation.totalPaid)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Pagato</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(summary.renovation.totalRemaining)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Rimanente</p>
            </div>
          </div>

          {summary.renovation.totalCost > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${(summary.renovation.totalPaid / summary.renovation.totalCost) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {((summary.renovation.totalPaid / summary.renovation.totalCost) * 100).toFixed(1)}%
                pagato
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
