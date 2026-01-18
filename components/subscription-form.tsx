"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceCombobox } from "@/components/service-combobox";
import type { Subscription, PeriodType } from "@/types/subscription";
import type { ServiceCatalog } from "@/types/service";
import { getAllServices } from "@/app/actions/services";

// Схема валидации формы
const subscriptionFormSchema = z.object({
  service_id: z.number().nullable().optional(),
  name: z.string().min(1, "Название обязательно"),
  cost: z.number().positive("Стоимость должна быть положительным числом"),
  currency: z.enum(["RUB", "USD", "EUR"]),
  period: z.enum([
    "weekly",
    "monthly",
    "3_months",
    "6_months",
    "yearly",
    "lifetime",
  ]),
  start_date: z.string().min(1, "Дата начала обязательна"),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SubscriptionFormValues) => Promise<void>;
  subscription?: Subscription | null;
  loading?: boolean;
}

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: "weekly", label: "7 дней" },
  { value: "monthly", label: "1 месяц" },
  { value: "3_months", label: "3 месяца" },
  { value: "6_months", label: "6 месяцев" },
  { value: "yearly", label: "1 год" },
  { value: "lifetime", label: "Бессрочная" },
];

export function SubscriptionForm({
  open,
  onOpenChange,
  onSubmit,
  subscription,
  loading = false,
}: SubscriptionFormProps) {
  const [services, setServices] = useState<ServiceCatalog[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [customServiceName, setCustomServiceName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      service_id: null,
      name: "",
      cost: 0,
      currency: "RUB",
      period: "monthly",
      start_date: new Date().toISOString().split("T")[0],
    },
  });

  const currency = watch("currency");
  const period = watch("period");

  // Загружаем сервисы при открытии формы
  useEffect(() => {
    if (open) {
      getAllServices().then(setServices);
    }
  }, [open]);

  // Заполняем форму данными подписки при редактировании
  useEffect(() => {
    if (subscription) {
      setSelectedServiceId(subscription.service_id);
      setValue("service_id", subscription.service_id);
      setValue("name", subscription.name);
      setValue("cost", subscription.cost);
      setValue("currency", subscription.currency);
      setValue("period", subscription.period);
      setValue(
        "start_date",
        new Date(subscription.start_date).toISOString().split("T")[0]
      );
      setCustomServiceName(subscription.name);
    } else {
      reset();
      setSelectedServiceId(null);
      setCustomServiceName("");
    }
  }, [subscription, setValue, reset]);

  const handleServiceSelect = (
    serviceId: number | null,
    service: ServiceCatalog | null
  ) => {
    setSelectedServiceId(serviceId);
    setValue("service_id", serviceId);
    if (service) {
      setValue("name", service.name);
      setValue("currency", service.default_currency);
      setCustomServiceName(service.name);
    }
  };

  const handleCustomService = (name: string) => {
    setSelectedServiceId(null);
    setValue("service_id", null);
    setValue("name", name);
    setCustomServiceName(name);
  };

  const onSubmitForm = async (data: SubscriptionFormValues) => {
    await onSubmit(data);
    if (!subscription) {
      reset();
      setSelectedServiceId(null);
      setCustomServiceName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {subscription ? "Редактировать подписку" : "Добавить подписку"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {subscription
              ? "Измените данные подписки"
              : "Заполните информацию о вашей подписке"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-medium">Сервис</Label>
            <ServiceCombobox
              services={services}
              value={selectedServiceId}
              onValueChange={handleServiceSelect}
              onCustomService={handleCustomService}
              placeholder="Выберите сервис или введите название"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Название <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Название подписки"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-sm font-medium">
                Стоимость <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                {...register("cost", { valueAsNumber: true })}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.cost && (
                <p className="text-sm text-destructive">
                  {errors.cost.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">Валюта</Label>
              <Select
                value={currency}
                onValueChange={(value) =>
                  setValue("currency", value as "RUB" | "USD" | "EUR")
                }
                disabled={loading}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">RUB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm font-medium">Период</Label>
              <Select
                value={period}
                onValueChange={(value) =>
                  setValue("period", value as PeriodType)
                }
                disabled={loading}
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium">
                Дата начала <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
                disabled={loading}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">
                  {errors.start_date.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Сохранение..."
                : subscription
                ? "Сохранить"
                : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
