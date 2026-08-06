import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const backendRes = await fetch(`${API_URL}/transactions/export${request.nextUrl.search}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!backendRes.ok) {
    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  }

  const buffer = await backendRes.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        backendRes.headers.get("Content-Type") ??
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        backendRes.headers.get("Content-Disposition") ?? 'attachment; filename="rekap-transaksi.xlsx"',
    },
  });
}
