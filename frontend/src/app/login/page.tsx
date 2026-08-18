import Image from "next/image";
import { redirect } from "next/navigation";
import { BarChart3, RefreshCw, ShieldCheck, Store } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/session";

const FEATURES = [
  {
    icon: RefreshCw,
    title: "Sinkron otomatis",
    description: "Order dari Tokopedia, Shopee & TikTok Shop masuk otomatis tiap 10 menit.",
  },
  {
    icon: BarChart3,
    title: "Rekap satu layar",
    description: "Omzet, stok, dan performa tiap channel dalam satu dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Akses per peran",
    description: "Admin, staf, dan gudang cuma lihat yang relevan buat mereka.",
  },
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -right-16 -bottom-16 aspect-square w-[62%]">
          <Image
            src="/6934766.jpg"
            alt=""
            fill
            priority
            sizes="40vw"
            className="object-contain mix-blend-multiply"
            style={{
              maskImage:
                "linear-gradient(135deg, transparent 0%, black 30%)",
              WebkitMaskImage:
                "linear-gradient(135deg, transparent 0%, black 30%)",
            }}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Store className="size-4" />
          </div>
          <span className="font-heading font-semibold">Rekap Omni</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl leading-tight font-semibold text-balance">
              Satu dashboard untuk semua channel penjualan.
            </h1>
            <p className="max-w-md text-sm text-primary-foreground/80">
              Rekap omzet, stok, dan status sinkronisasi Tokopedia, Shopee, Website, dan
              TikTok Shop tanpa buka-tutup aplikasi satu-satu.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <f.icon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{f.title}</span>
                  <span className="text-xs text-primary-foreground/70">{f.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Rekap Omnichannel
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-muted/20 p-4">
        <LoginForm />
      </div>
    </div>
  );
}
