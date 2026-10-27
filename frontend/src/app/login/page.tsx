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
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-indigo-700 to-slate-950 p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-16 -bottom-16 aspect-square w-[62%] opacity-60">
          <Image
            src="/6934766.jpg"
            alt=""
            fill
            priority
            sizes="40vw"
            className="object-contain mix-blend-screen"
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
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/15">
            <Store className="size-4" />
          </div>
          <span className="font-heading font-semibold tracking-tight">Rekap Omni</span>
        </div>

        <div className="relative flex max-w-xl flex-col gap-9">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase backdrop-blur">
              Satu sistem, semua channel
            </span>
            <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance xl:text-5xl">
              Satu dashboard untuk semua channel penjualan.
            </h1>
            <p className="max-w-md text-sm leading-6 text-white/75">
              Rekap omzet, stok, dan status sinkronisasi Tokopedia, Shopee, Website, dan
              TikTok Shop tanpa buka-tutup aplikasi satu-satu.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <f.icon className="size-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{f.title}</span>
                  <span className="text-xs leading-5 text-white/65">{f.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Rekap Omnichannel
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,oklch(0.94_0.035_263_/_0.55),transparent_50%),var(--background)] p-4 sm:p-8">
        <LoginForm />
      </div>
    </div>
  );
}
