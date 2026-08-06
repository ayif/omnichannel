import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/sync/[channel]/trigger">,
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const { channel } = await ctx.params;

  const backendRes = await fetch(`${API_URL}/sync-logs/${channel}/trigger`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}
