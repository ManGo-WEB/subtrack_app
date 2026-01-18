import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptions } from "@/app/actions/subscriptions";
import { getExchangeRates } from "@/app/actions/exchange-rates";
import { calculateMonthlyTotal, calculateMonthlyOnlyTotal } from "@/lib/utils/totals";
import { DashboardClient } from "@/components/dashboard-client";
import type { Subscription, SubscriptionWithService } from "@/types/subscription";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Загружаем данные параллельно
  const [subscriptions, exchangeRates] = await Promise.all([
    getSubscriptions(),
    getExchangeRates(),
  ]);

  // Рассчитываем итоговые суммы
  const monthlyTotal = calculateMonthlyTotal(
    subscriptions as Subscription[],
    exchangeRates
  );
  const monthlyOnlyTotal = calculateMonthlyOnlyTotal(
    subscriptions as Subscription[],
    exchangeRates
  );

  return (
    <DashboardClient
      subscriptions={subscriptions as SubscriptionWithService[]}
      monthlyTotal={monthlyTotal}
      monthlyOnlyTotal={monthlyOnlyTotal}
    />
  );
}
