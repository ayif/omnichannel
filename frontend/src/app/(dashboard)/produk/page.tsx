import { AlertTriangle, Package, PackageCheck, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProdukTable } from "@/components/dashboard/produk-table";
import { getProducts } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default async function ProdukPage() {
  const products = await getProducts();
  const lowStock = products.filter((p) => p.jumlahStok <= p.stokMinimum);
  const totalNilaiInventori = products.reduce(
    (s, p) => s + p.hargaDasar * p.jumlahStok,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Produk" value={String(products.length)} icon={Package} />
        <StatCard
          label="Stok Menipis"
          value={String(lowStock.length)}
          icon={AlertTriangle}
          tone={lowStock.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Nilai Inventori"
          value={formatCurrency(totalNilaiInventori)}
          icon={Wallet}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="size-4" />
            Daftar Produk & Stok
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ProdukTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
