"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? "Email atau password salah");
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rounded-3xl border-border/70 bg-card/95 shadow-xl shadow-slate-950/[0.07] backdrop-blur">
      <CardHeader className="gap-3 px-7 pt-8 sm:px-9 sm:pt-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-md shadow-primary/20">
            <Store className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading font-semibold tracking-tight">Rekap Omni</span>
            <span className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Business workspace
            </span>
          </div>
        </div>
        <CardTitle className="font-heading text-2xl tracking-tight">Selamat datang kembali</CardTitle>
        <CardDescription className="text-sm leading-6">
          Masuk untuk melihat ringkasan penjualan dan operasional toko Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-8 sm:px-9 sm:pb-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@rekap.local"
              required
              autoFocus
              className="h-11 rounded-xl bg-background/80 px-3.5"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="h-11 rounded-xl bg-background/80 px-3.5"
            />
          </div>
          {error && <p className="text-sm text-status-critical">{error}</p>}
          <Button type="submit" disabled={pending} className="mt-1 h-11 w-full rounded-xl">
            {pending && <Loader2 className="animate-spin" />}
            Masuk
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Akses aman untuk tim operasional Anda
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
