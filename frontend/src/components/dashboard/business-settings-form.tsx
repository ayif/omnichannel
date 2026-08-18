"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessSettings } from "@/lib/types";

export function BusinessSettingsForm({
  business,
  editable,
}: {
  business: BusinessSettings;
  editable: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/settings/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaBisnis: formData.get("namaBisnis"),
          alamat: formData.get("alamat"),
          telepon: formData.get("telepon"),
          email: formData.get("email"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Gagal menyimpan informasi bisnis");

      toast.success("Informasi bisnis berhasil disimpan");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan informasi bisnis");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business-nama">Nama Bisnis/Toko</Label>
        <Input
          id="business-nama"
          name="namaBisnis"
          defaultValue={business.namaBisnis}
          disabled={!editable}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business-alamat">Alamat</Label>
        <Textarea
          id="business-alamat"
          name="alamat"
          defaultValue={business.alamat ?? ""}
          disabled={!editable}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business-telepon">Telepon</Label>
        <Input
          id="business-telepon"
          name="telepon"
          defaultValue={business.telepon ?? ""}
          disabled={!editable}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business-email">Email Bisnis</Label>
        <Input
          id="business-email"
          name="email"
          type="email"
          defaultValue={business.email ?? ""}
          disabled={!editable}
        />
      </div>
      {editable && (
        <Button type="submit" disabled={pending} className="w-fit">
          {pending && <Loader2 className="animate-spin" />}
          Simpan
        </Button>
      )}
    </form>
  );
}
