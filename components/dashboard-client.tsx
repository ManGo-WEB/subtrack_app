"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionForm } from "@/components/subscription-form";
import { SubscriptionCard } from "@/components/subscription-card";
import { SubscriptionCardSkeleton } from "@/components/subscription-card-skeleton";
import { MonthlyTotal } from "@/components/monthly-total";
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptions,
} from "@/app/actions/subscriptions";
import { getExchangeRates } from "@/app/actions/exchange-rates";
import { calculateMonthlyTotal, calculateMonthlyOnlyTotal } from "@/lib/utils/totals";
import type { Subscription, SubscriptionWithService } from "@/types/subscription";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardClientProps {
  subscriptions: SubscriptionWithService[];
  monthlyTotal: number;
  monthlyOnlyTotal: number;
}

export function DashboardClient({
  subscriptions: initialSubscriptions,
  monthlyTotal: initialMonthlyTotal,
  monthlyOnlyTotal: initialMonthlyOnlyTotal,
}: DashboardClientProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [monthlyTotal, setMonthlyTotal] = useState(initialMonthlyTotal);
  const [monthlyOnlyTotal, setMonthlyOnlyTotal] = useState(initialMonthlyOnlyTotal);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Синхронизируем состояние с пропсами при обновлении
  useEffect(() => {
    setSubscriptions(initialSubscriptions);
    setMonthlyTotal(initialMonthlyTotal);
    setMonthlyOnlyTotal(initialMonthlyOnlyTotal);
  }, [initialSubscriptions, initialMonthlyTotal, initialMonthlyOnlyTotal]);

  const handleCreate = async (data: {
    service_id: number | null;
    name: string;
    cost: number;
    currency: "RUB" | "USD" | "EUR";
    period: string;
    start_date: string;
  }) => {
    setIsLoading(true);
    try {
      await createSubscription(data);
      toast.success("Подписка успешно добавлена");
      setIsFormOpen(false);
      
      // Обновляем список подписок и итоговые суммы
      const [updatedSubscriptions, exchangeRates] = await Promise.all([
        getSubscriptions(),
        getExchangeRates(),
      ]);
      setSubscriptions(updatedSubscriptions);
      const newTotal = calculateMonthlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      const newMonthlyOnlyTotal = calculateMonthlyOnlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      setMonthlyTotal(newTotal);
      setMonthlyOnlyTotal(newMonthlyOnlyTotal);
      
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не удалось создать подписку"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: {
    service_id: number | null;
    name: string;
    cost: number;
    currency: "RUB" | "USD" | "EUR";
    period: string;
    start_date: string;
  }) => {
    if (!editingSubscription) return;

    setIsLoading(true);
    try {
      await updateSubscription(editingSubscription.id, data);
      toast.success("Подписка успешно обновлена");
      setIsFormOpen(false);
      setEditingSubscription(null);
      
      // Обновляем список подписок и итоговые суммы
      const [updatedSubscriptions, exchangeRates] = await Promise.all([
        getSubscriptions(),
        getExchangeRates(),
      ]);
      setSubscriptions(updatedSubscriptions);
      const newTotal = calculateMonthlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      const newMonthlyOnlyTotal = calculateMonthlyOnlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      setMonthlyTotal(newTotal);
      setMonthlyOnlyTotal(newMonthlyOnlyTotal);
      
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не удалось обновить подписку"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription(id);
      toast.success("Подписка успешно удалена");
      
      // Обновляем список подписок и итоговые суммы
      const [updatedSubscriptions, exchangeRates] = await Promise.all([
        getSubscriptions(),
        getExchangeRates(),
      ]);
      setSubscriptions(updatedSubscriptions);
      const newTotal = calculateMonthlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      const newMonthlyOnlyTotal = calculateMonthlyOnlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      setMonthlyTotal(newTotal);
      setMonthlyOnlyTotal(newMonthlyOnlyTotal);
      
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не удалось удалить подписку"
      );
      throw error;
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubscription(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Подписки</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управление вашими подписками
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </div>

      <MonthlyTotal total={monthlyTotal} monthlyOnlyTotal={monthlyOnlyTotal} isLoading={isLoading} />

      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-6">
            У вас пока нет подписок
          </p>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Добавить подписку
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={isLoading}
              serviceData={subscription.service}
            />
          ))}
        </div>
      )}

      <SubscriptionForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingSubscription ? handleUpdate : handleCreate}
        subscription={editingSubscription}
        loading={isLoading}
      />
    </div>
  );
}
