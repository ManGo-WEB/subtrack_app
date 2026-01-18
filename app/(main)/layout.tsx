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
      <header className="border-b border-border/40 bg-foreground/95 backdrop-blur supports-[backdrop-filter]:bg-foreground/95">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight text-background">
            SubTrack
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-background/70 hidden sm:inline-block">
              {user.email}
            </span>
            <form action="/logout" method="post">
              <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs text-background hover:bg-background/20 hover:text-background">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
