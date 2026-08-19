import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/channel-api-configs/[channel]">,
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const { channel } = await ctx.params;
  const body = await request.json();

  const backendRes = await fetch(`${API_URL}/channel-api-configs/${channel}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}
