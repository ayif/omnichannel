import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/channel-accounts/connect/[channel]">,
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.redirect(new URL("/login", _request.url));
  }

  const { channel } = await ctx.params;

  const backendRes = await fetch(`${API_URL}/channel-accounts/${channel}/connect`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!backendRes.ok) {
    const url = new URL("/sinkronisasi", _request.url);
    url.searchParams.set("error", `Gagal memulai koneksi ${channel}`);
    return NextResponse.redirect(url);
  }

  const { url } = (await backendRes.json()) as { url: string };
  return NextResponse.redirect(url);
}
