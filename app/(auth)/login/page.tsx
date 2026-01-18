"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Произошла ошибка при входе"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage("Проверьте вашу почту для входа по ссылке");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при отправке ссылки"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Вход в SubTrack</CardTitle>
          <CardDescription className="text-sm mt-1">
            Войдите, чтобы продолжить работу с трекером подписок
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Форма входа по email и паролю */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                или
              </span>
            </div>
          </div>

          {/* Форма Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="magic-link-email" className="text-sm font-medium">Вход по ссылке</Label>
              <Input
                id="magic-link-email"
                type="email"
                placeholder="example@mail.com"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {message && (
              <div className="text-sm text-muted-foreground">{message}</div>
            )}
            <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
              {isLoading ? "Отправка..." : "Отправить ссылку на email"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary underline">
              Зарегистрироваться
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
