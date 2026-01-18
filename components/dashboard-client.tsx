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
import { calculateMonthlyTotal } from "@/lib/utils/totals";
import type { Subscription, SubscriptionWithService } from "@/types/subscription";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardClientProps {
  subscriptions: SubscriptionWithService[];
  monthlyTotal: number;
}

export function DashboardClient({
  subscriptions: initialSubscriptions,
  monthlyTotal: initialMonthlyTotal,
}: DashboardClientProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [monthlyTotal, setMonthlyTotal] = useState(initialMonthlyTotal);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Синхронизируем состояние с пропсами при обновлении
  useEffect(() => {
    setSubscriptions(initialSubscriptions);
    setMonthlyTotal(initialMonthlyTotal);
  }, [initialSubscriptions, initialMonthlyTotal]);

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
      
      // Обновляем список подписок и итоговую сумму
      const [updatedSubscriptions, exchangeRates] = await Promise.all([
        getSubscriptions(),
        getExchangeRates(),
      ]);
      setSubscriptions(updatedSubscriptions);
      const newTotal = calculateMonthlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      setMonthlyTotal(newTotal);
      
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
      
      // Обновляем список подписок и итоговую сумму
      const [updatedSubscriptions, exchangeRates] = await Promise.all([
        getSubscriptions(),
        getExchangeRates(),
      ]);
      setSubscriptions(updatedSubscriptions);
      const newTotal = calculateMonthlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      setMonthlyTotal(newTotal);
      
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
      
      // Обновляем список подписок и итоговую сумму
      const [updatedSubscriptions, exchangeRates] = await Promise.all([
        getSubscriptions(),
        getExchangeRates(),
      ]);
      setSubscriptions(updatedSubscriptions);
      const newTotal = calculateMonthlyTotal(
        updatedSubscriptions as Subscription[],
        exchangeRates
      );
      setMonthlyTotal(newTotal);
      
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Мои подписки</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить подписку
        </Button>
      </div>

      <MonthlyTotal total={monthlyTotal} isLoading={isLoading} />

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            У вас пока нет подписок
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить первую подписку
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
