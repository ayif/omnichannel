import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: 'Sesi login tidak ditemukan.' }, { status: 401 });
  }

  let message: unknown;
  try {
    const body: unknown = await request.json();
    message = body && typeof body === 'object' ? (body as { message?: unknown }).message : undefined;
  } catch {
    return NextResponse.json({ message: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  if (typeof message !== 'string' || message.trim().length < 2 || message.length > 1200) {
    return NextResponse.json(
      { message: 'Pertanyaan harus berisi 2 sampai 1200 karakter.' },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${API_URL}/ai-assistant/ask`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message.trim() }),
      cache: 'no-store',
    });
    const data = await backendResponse.json().catch(() => ({ message: 'Backend mengembalikan respons tidak valid.' }));
    return NextResponse.json(data, { status: backendResponse.status });
  } catch {
    return NextResponse.json(
      { message: 'Tidak dapat terhubung ke backend. Coba lagi nanti.' },
      { status: 502 },
    );
  }
}
