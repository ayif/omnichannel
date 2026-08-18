import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function PATCH(request: Request) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const body = await request.json();
  const backendRes = await fetch(`${API_URL}/users/me/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}
