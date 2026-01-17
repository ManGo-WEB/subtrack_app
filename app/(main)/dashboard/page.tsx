import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptions } from "@/app/actions/subscriptions";
import { getExchangeRates } from "@/app/actions/exchange-rates";
import { calculateMonthlyTotal } from "@/lib/utils/totals";
import { DashboardClient } from "@/components/dashboard-client";
import type { Subscription } from "@/types/subscription";

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

  // Рассчитываем итоговую сумму
  const monthlyTotal = calculateMonthlyTotal(
    subscriptions as Subscription[],
    exchangeRates
  );

  return (
    <DashboardClient
      subscriptions={subscriptions as Subscription[]}
      monthlyTotal={monthlyTotal}
    />
  );
}
