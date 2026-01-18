"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, Edit, Trash2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Subscription } from "@/types/subscription";
import type { ServiceCatalog } from "@/types/service";
import { getNextPaymentDate, isPaymentDateNear } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  serviceData?: ServiceCatalog | null;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  loading = false,
  serviceData = null,
}: SubscriptionCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const nextPaymentDate = getNextPaymentDate(
    subscription.start_date,
    subscription.period
  );

  const isDateNear = nextPaymentDate
    ? isPaymentDateNear(nextPaymentDate, 3)
    : false;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(subscription.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Ошибка удаления подписки:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatNextPayment = () => {
    if (subscription.period === "lifetime") {
      return "Навсегда";
    }
    if (!nextPaymentDate) {
      return "Неизвестно";
    }
    return format(nextPaymentDate, "d MMM yyyy", { locale: ru });
  };

  return (
    <>
      <Card
        className={cn(
          "transition-all hover:shadow-md animate-fade-in",
          isDateNear && "border-destructive/50 bg-destructive/5"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{subscription.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(
                  subscription.cost,
                  subscription.currency,
                  false
                )}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(subscription)}
                disabled={loading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span
              className={cn(
                isDateNear && "font-semibold text-destructive"
              )}
            >
              След. списание: {formatNextPayment()}
            </span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить подписку?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить подписку "{subscription.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
