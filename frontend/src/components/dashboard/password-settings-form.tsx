"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordSettingsForm() {
  const [pending, setPending] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Gagal mengubah password");

      toast.success("Password berhasil diubah");
      formRef.current?.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah password");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Password Saat Ini</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">Password Baru</Label>
        <Input id="newPassword" name="newPassword" type="password" minLength={6} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" minLength={6} required />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending && <Loader2 className="animate-spin" />}
        Ubah Password
      </Button>
    </form>
  );
}
