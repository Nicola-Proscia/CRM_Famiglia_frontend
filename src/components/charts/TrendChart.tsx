import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendPoint } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface TrendChartProps {
  data: TrendPoint[];
}

const formatAmount = (value: number) => formatCurrency(value);

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatAmount} tick={{ fontSize: 11 }} width={90} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          name="Entrate"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Uscite"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
