'use client';

import { FormEvent, useState } from 'react';
import { AlertTriangle, Bot, CheckCircle2, Database, LoaderCircle, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface AssistantSource {
  tool: string;
  label: string;
  referenceIds: string[];
}

interface AssistantResponse {
  intent: string;
  summary: string;
  answer: string;
  confidence: number;
  riskFlags: string[];
  missingInformation: string[];
  sourceData: AssistantSource[];
  requiresHumanReview: true;
  readOnly: true;
}

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: AssistantResponse;
}

const EXAMPLES = [
  'Cari produk dengan stok di bawah batas minimum.',
  'Ringkas omzet barang 7 hari terakhir.',
  'Tampilkan transaksi Shopee yang masih pending.',
];

function formatIntent(intent: string) {
  return intent.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export function AssistantPanel() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function submitQuestion(event?: FormEvent<HTMLFormElement>, preset?: string) {
    event?.preventDefault();
    const question = (preset ?? message).trim();
    if (question.length < 2 || isLoading) return;

    const userEntry: ChatEntry = { id: crypto.randomUUID(), role: 'user', content: question };
    setEntries((current) => [...current, userEntry]);
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });
      const data = (await response.json().catch(() => ({}))) as AssistantResponse & { message?: string };
      if (!response.ok) throw new Error(data.message || 'Asisten belum dapat menjawab. Coba lagi.');
      setEntries((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', content: data.answer, response: data },
      ]);
    } catch (requestError) {
      const messageText = requestError instanceof Error ? requestError.message : 'Terjadi kesalahan. Coba lagi.';
      setError(messageText);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Asisten AI</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Tanya tentang katalog, stok, transaksi, dan ringkasan penjualan.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 py-1">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          Baca saja
        </Badge>
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="text-muted-foreground">
          Pertanyaan dan data bisnis yang diperlukan untuk menjawab akan dikirim ke OpenAI. Jangan masukkan data pribadi pembeli. Jawaban hanya rekomendasi internal dan perlu diperiksa staf.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card className="min-h-72 justify-center border-dashed bg-card/70">
          <CardContent className="mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <h2 className="font-heading text-lg font-semibold">Apa yang ingin kamu cek?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Asisten memakai data aplikasi yang tersedia dan menampilkan sumber yang dibaca.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((example) => (
                <Button
                  key={example}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => void submitQuestion(undefined, example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4" aria-live="polite">
          {entries.map((entry) => (
            <div key={entry.id} className={entry.role === 'user' ? 'ml-auto max-w-[88%]' : 'w-full'}>
              {entry.role === 'user' ? (
                <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
                  {entry.content}
                </div>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Bot className="size-4 text-primary" />
                        <CardTitle>Jawaban asisten</CardTitle>
                      </div>
                      {entry.response && (
                        <Badge variant="secondary">{formatIntent(entry.response.intent)}</Badge>
                      )}
                    </div>
                    {entry.response?.summary && <CardDescription>{entry.response.summary}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="whitespace-pre-wrap text-sm leading-6">{entry.content}</p>

                    {entry.response?.missingInformation.length ? (
                      <div className="rounded-lg bg-amber-500/5 p-3 text-sm">
                        <p className="mb-1 font-medium">Informasi yang belum tersedia</p>
                        <ul className="list-inside list-disc text-muted-foreground">
                          {entry.response.missingInformation.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                        </ul>
                      </div>
                    ) : null}

                    {entry.response?.riskFlags.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.response.riskFlags.map((flag) => (
                          <Badge key={flag} variant="outline">{flag.replaceAll('_', ' ')}</Badge>
                        ))}
                      </div>
                    ) : null}

                    {entry.response && (
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <Database className="size-4 text-muted-foreground" />
                          Sumber data
                        </div>
                        {entry.response.sourceData.length ? (
                          <div className="flex flex-col gap-2">
                            {entry.response.sourceData.map((source) => (
                              <div key={source.tool} className="flex flex-wrap items-center gap-2 text-xs">
                                <Badge variant="secondary">{source.label}</Badge>
                                <span className="text-muted-foreground">
                                  {source.referenceIds.length ? source.referenceIds.join(', ') : 'Tidak ada hasil'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Tidak ada data aplikasi yang dipakai untuk jawaban ini.</p>
                        )}
                      </div>
                    )}

                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Keyakinan model {(entry.response?.confidence ?? 0) * 100}% · tetap periksa sebelum digunakan
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 self-start rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Membaca data dan menyiapkan jawaban...
            </div>
          )}
          <div id="latest-answer" />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-3">
          <form onSubmit={(event) => void submitQuestion(event)} className="flex flex-col gap-2">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Contoh: ringkas penjualan bulan ini per channel..."
              maxLength={1200}
              rows={3}
              disabled={isLoading}
              aria-label="Pertanyaan untuk asisten AI"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Pertanyaan baru diproses mandiri, tanpa mengirim riwayat chat sebelumnya.</p>
              <Button type="submit" disabled={isLoading || message.trim().length < 2}>
                {isLoading ? <LoaderCircle className="animate-spin" /> : <Send />}
                Kirim pertanyaan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
