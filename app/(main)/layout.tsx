import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-bold">
            SubTrack
          </Link>
          <form action="/logout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
