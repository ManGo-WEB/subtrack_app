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
    <Card>
      <CardHeader>
        <CardTitle>Итого в месяц</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {formatCurrency(total, "RUB", true)}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Примерно, по курсу ЦБ РФ
        </p>
      </CardContent>
    </Card>
  );
}
