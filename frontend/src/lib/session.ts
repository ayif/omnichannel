import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { Role } from "./types";

export const SESSION_COOKIE = "session";

export interface SessionUser {
  sub: string;
  email: string;
  nama: string;
  role: Role;
}

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/**
 * Validasi token ke backend (bukan cuma decode) supaya token yang sudah
 * kedaluwarsa/dicabut tetap dianggap tidak login. Di-cache per request
 * supaya layout + page yang sama-sama butuh user tidak dobel fetch.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  return res.json() as Promise<SessionUser>;
});
