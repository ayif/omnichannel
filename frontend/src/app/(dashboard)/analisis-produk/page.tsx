import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalisisProdukFilter } from "@/components/dashboard/analisis-produk-filter";
import { ProdukTerlarisTable } from "@/components/dashboard/produk-terlaris-table";
import { StokTercepatHabisTable } from "@/components/dashboard/stok-tercepat-habis-table";
import { getProdukTerlaris, getStokTercepatHabis } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { Channel, Role } from "@/lib/types";

export default async function AnalisisProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; startDate?: string; endDate?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role === Role.GUDANG) {
    redirect("/produk");
  }

  const params = await searchParams;
  const [produkTerlaris, stokTercepatHabis] = await Promise.all([
    getProdukTerlaris({
      channel: params.channel as Channel | undefined,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    getStokTercepatHabis(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <AnalisisProdukFilter />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Produk Terlaris
          </CardTitle>
          <CardDescription>Peringkat produk berdasarkan qty terjual, dipecah per channel</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ProdukTerlarisTable data={produkTerlaris} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="size-4" />
            Prediksi Stok Habis
          </CardTitle>
          <CardDescription>
            Proyeksi berdasarkan kecepatan penjualan 30 hari terakhir - bukan machine learning, murni statistik
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <StokTercepatHabisTable data={stokTercepatHabis} />
        </CardContent>
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5" />
        Analisis Produk dihitung otomatis dari data transaksi &amp; stok - bukan data pencarian/traffic marketplace
        (belum tersedia, butuh integrasi API resmi tiap channel).
      </p>
    </div>
  );
}
