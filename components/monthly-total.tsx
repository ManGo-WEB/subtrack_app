"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";

interface MonthlyTotalProps {
  total: number | null;
  isLoading?: boolean;
}

export function MonthlyTotal({ total, isLoading = false }: MonthlyTotalProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Итого в месяц</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (total === null) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm bg-primary/10">
      <CardHeader className="pb-3 pt-6 px-6">
        <CardTitle className="text-sm font-medium text-foreground">
          Итого в месяц
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-6 pb-6">
        <div className="text-3xl font-semibold tracking-tight mb-1 text-primary">
          {formatCurrency(total, "RUB", true)}
        </div>
        <p className="text-xs text-muted-foreground">
          Примерно, по курсу ЦБ РФ
        </p>
      </CardContent>
    </Card>
  );
}
