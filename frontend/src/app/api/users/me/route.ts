import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getToken, SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function PATCH(request: Request) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const body = await request.json();
  const backendRes = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));
  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const { accessToken, user } = data;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });

  return NextResponse.json({ user });
}
