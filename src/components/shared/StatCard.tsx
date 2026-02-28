import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{title}</p>
          {icon && <div className="text-muted-foreground flex-shrink-0">{icon}</div>}
        </div>
        <div className="mt-2">
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
