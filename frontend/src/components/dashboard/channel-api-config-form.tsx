"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ChannelLogo } from "@/components/dashboard/channel-logo";
import { formatDateTime } from "@/lib/format";
import { CHANNEL_LABEL, type ChannelApiConfigSummary } from "@/lib/types";

function ChannelApiConfigTab({ config }: { config: ChannelApiConfigSummary }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const allSet = config.fields.filter((f) => f.required).every((f) => f.isSet || f.value);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    for (const field of config.fields) {
      values[field.key] = String(formData.get(field.key) ?? "");
    }

    try {
      const res = await fetch(`/api/channel-api-configs/${config.channel}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Gagal menyimpan konfigurasi API");

      toast.success(`Konfigurasi API ${CHANNEL_LABEL[config.channel]} berhasil disimpan`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi API");
    } finally {
      setPending(false);
    }
  }

  const updatedAtLabel = config.updatedAt ? formatDateTime(config.updatedAt) : null;

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge variant={allSet ? "default" : "outline"}>
          {allSet ? "Terkonfigurasi" : "Belum lengkap"}
        </Badge>
        {updatedAtLabel && (
          <span className="text-xs text-muted-foreground">Terakhir diubah {updatedAtLabel}</span>
        )}
      </div>

      {config.fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <Label htmlFor={`${config.channel}-${field.key}`}>
            {field.label}
            {!field.required && <span className="text-muted-foreground"> (opsional)</span>}
          </Label>
          <Input
            id={`${config.channel}-${field.key}`}
            name={field.key}
            type={field.secret ? "password" : "text"}
            placeholder={
              field.secret
                ? field.isSet
                  ? "•••••••• (biarkan kosong jika tidak diubah)"
                  : field.placeholder
                : field.placeholder
            }
            defaultValue={field.secret ? "" : (field.value ?? "")}
            required={field.secret ? field.required && !field.isSet : field.required}
            autoComplete="off"
          />
        </div>
      ))}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending && <Loader2 className="animate-spin" />}
        Simpan
      </Button>
    </form>
  );
}

export function ChannelApiConfigCard({ configs }: { configs: ChannelApiConfigSummary[] }) {
  if (configs.length === 0) return null;

  return (
    <Tabs defaultValue={configs[0].channel}>
      <TabsList>
        {configs.map((config) => (
          <TabsTrigger key={config.channel} value={config.channel} className="gap-1.5">
            <ChannelLogo channel={config.channel} />
            {CHANNEL_LABEL[config.channel]}
          </TabsTrigger>
        ))}
      </TabsList>
      {configs.map((config) => (
        <TabsContent key={config.channel} value={config.channel} className="pt-4">
          <ChannelApiConfigTab config={config} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
