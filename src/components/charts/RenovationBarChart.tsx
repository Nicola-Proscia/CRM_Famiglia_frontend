import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface RenovationBarData {
  name: string;
  totalCost: number;
  totalPaid: number;
  totalRemaining: number;
}

interface RenovationBarChartProps {
  data: RenovationBarData[];
}

export function RenovationBarChart({ data }: RenovationBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} width={90} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="totalPaid" name="Pagato" fill="#22c55e" stackId="a" />
        <Bar dataKey="totalRemaining" name="Rimanente" fill="#f59e0b" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
