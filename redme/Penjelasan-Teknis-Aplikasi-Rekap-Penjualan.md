# Penjelasan Teknis: Aplikasi Rekap Transaksi Multi-Channel & Stok

Web app custom untuk merekap transaksi dari Tokopedia, Shopee, dan website sendiri, dengan integrasi API resmi marketplace dan manajemen stok terpusat.

## 1. Arsitektur Umum

```
[Tokopedia API] ─┐
[Shopee API]    ─┼──> [Integration Layer / Sync Worker] ──> [Database Pusat] ──> [Dashboard/Reporting]
[Website Sendiri]─┘         (queue + scheduler)                    │
                                                              [Stock Engine]
```

Prinsip intinya: setiap channel penjualan (Tokopedia, Shopee, Website) adalah *sumber data*, bukan sumber kebenaran stok. Sumber kebenaran stok (source of truth) ada di database pusat aplikasi, lalu didorong (push) balik ke tiap channel supaya tidak oversell.

Empat komponen utama:

- **Integration Layer** — modul yang komunikasi dengan API Tokopedia, Shopee, dan sistem website, menangani auth, rate limit, dan format data yang beda-beda.
- **Sync Worker / Scheduler** — proses background (queue + cron) yang menarik data transaksi baru secara berkala dan mendorong update stok ke semua channel.
- **Database Pusat** — menyimpan produk, stok, transaksi ternormalisasi dari semua channel, dan log sinkronisasi.
- **Dashboard/Reporting** — antarmuka web untuk melihat rekap penjualan, stok, dan status sinkronisasi.

## 2. Tech Stack yang Direkomendasikan

| Layer | Rekomendasi | Alasan |
|---|---|---|
| Backend | Node.js (NestJS/Express) atau Python (FastAPI/Django) | Ekosistem matang untuk integrasi REST API, banyak SDK/contoh untuk Tokopedia & Shopee |
| Queue/Scheduler | BullMQ (Redis) atau Celery (Python) | Perlu retry otomatis untuk panggilan API yang gagal/kena rate limit |
| Database | PostgreSQL | Relasi kuat antar produk-stok-transaksi-channel, mendukung transaksi ACID untuk cegah race condition stok |
| Cache | Redis | Cache token OAuth, rate-limit counter, dan cache katalog produk |
| Frontend | React/Next.js + Tailwind | Dashboard reporting, filter multi-channel, grafik penjualan |
| Hosting | VPS/Cloud (misal: AWS, GCP, atau DigitalOcean) + Docker | Perlu proses background yang jalan terus (worker), bukan sekadar hosting statis |
| Auth internal | JWT + role-based access | Kalau dipakai tim (admin, staf gudang, dsb) |

## 3. Integrasi API Marketplace

### 3.1 Tokopedia (Seller API / Tokopedia Open API)

- Perlu daftar sebagai partner developer di **Tokopedia Developer Portal**, dapat `client_id` dan `client_secret`.
- Autentikasi pakai OAuth 2.0 (client credentials untuk sebagian besar endpoint fulfillment).
- Endpoint penting: Order List, Order Detail, Acknowledge Order, Update Stock (Product Info API), Update Price.
- Rate limit ketat per endpoint — wajib pakai queue dengan backoff, bukan polling agresif.

### 3.2 Shopee (Shopee Open Platform API v2)

- Daftar di **Shopee Open Platform**, dapat `partner_id` dan `partner_key`.
- Autentikasi pakai signature (HMAC-SHA256) per request + access token/refresh token yang expire (perlu auto-refresh).
- Endpoint penting: `order.get_order_list`, `order.get_order_detail`, `product.update_stock`, `push` (webhook) untuk notifikasi order baru.
- Shopee menyediakan webhook (push notification) untuk event order — ini lebih efisien daripada polling terus-menerus.

### 3.3 Website Sendiri

- Kalau website pakai platform e-commerce (WooCommerce, Shopify, custom), integrasi paling gampang lewat webhook internal: setiap ada order baru, website kirim POST ke endpoint aplikasi rekap.
- Kalau custom-built, bisa langsung baca dari database website via API internal atau shared database.

### 3.4 Pola Umum Sinkronisasi

1. **Pull terjadwal** (tiap 5–15 menit) untuk ambil order baru dari Tokopedia/Shopee.
2. **Webhook/push** dipakai kalau tersedia (Shopee, website sendiri) untuk update near-real-time.
3. Semua data mentah dari tiap channel dinormalisasi ke skema transaksi internal yang seragam sebelum disimpan (karena struktur JSON Tokopedia dan Shopee beda total).
4. Simpan `raw_payload` asli tiap transaksi untuk keperluan audit/debug kalau ada selisih data.

## 4. Skema Database (Inti)

```
products
├─ id, sku, nama_produk, kategori, harga_dasar

product_channel_mapping        -- 1 produk bisa punya ID berbeda di tiap channel
├─ product_id, channel (tokopedia/shopee/website), channel_product_id, channel_price

stock
├─ product_id, jumlah_stok, updated_at

transactions
├─ id, channel, channel_order_id (unique), product_id, qty, harga_jual,
│  ongkos_kirim, status (pending/paid/shipped/completed/cancelled/refund), tanggal_transaksi

stock_movements                -- audit trail perubahan stok
├─ product_id, jumlah_perubahan, sumber (transaksi/manual/restock), timestamp

sync_logs
├─ channel, status, waktu_mulai, waktu_selesai, jumlah_data_ditarik, error_message
```

Poin penting:

- `channel_order_id` diberi *unique constraint* per channel supaya proses sync yang jalan berulang tidak menduplikasi transaksi (idempotent).
- `product_channel_mapping` penting karena satu produk fisik yang sama biasanya punya SKU/ID berbeda di Tokopedia, Shopee, dan website.

## 5. Manajemen Stok Terpusat

Karena stok yang sama dijual di 3 channel sekaligus, risiko utamanya adalah **oversell** (barang laku di dua tempat padahal stok tinggal 1). Pendekatan yang lazim dipakai:

1. Stok fisik disimpan satu tempat: database pusat.
2. Setiap ada transaksi baru masuk (dari channel manapun), stok pusat langsung dikurangi dalam satu transaksi database (pakai row-level lock/transaction di PostgreSQL untuk cegah race condition).
3. Setelah stok pusat berubah, sistem langsung push update stok terbaru ke semua channel lain via API (Tokopedia Update Stock, Shopee `product.update_stock`).
4. Kalau update ke salah satu channel gagal (API down/rate limit), masuk retry queue — jangan biarkan stok channel itu telat diperbarui tanpa terdeteksi.
5. Opsional: sisakan buffer stok (misal tampilkan stok - 1) di channel dengan traffic tinggi untuk mitigasi delay sinkronisasi.

## 6. Reporting/Dashboard

Fitur dasar yang biasanya dibutuhkan:

- Rekap penjualan per channel, per periode, per produk (total qty, omzet, rata-rata harga jual).
- Perbandingan performa channel (Tokopedia vs Shopee vs Website).
- Status stok real-time + alert stok menipis.
- Log sinkronisasi (kapan terakhir berhasil tarik data dari tiap channel, kalau ada error).
- Export rekap ke Excel/PDF untuk laporan bulanan (bisa reuse skill xlsx/pdf kalau dibutuhkan nanti).

## 7. Keamanan

- Simpan `client_secret`, `partner_key`, dan access/refresh token terenkripsi (bukan plain text di database).
- Refresh token Shopee/Tokopedia harus di-refresh otomatis sebelum expired (biasanya lewat scheduled job).
- Batasi akses dashboard dengan role: admin (full access), staf (lihat rekap saja), gudang (kelola stok saja).

## 8. Tantangan Teknis yang Perlu Diantisipasi

- **Rate limiting** — Tokopedia & Shopee membatasi jumlah request per menit; desain sync worker harus antre, bukan langsung tembak semua sekaligus.
- **Perbedaan struktur data** — status order, format alamat, dan field harga berbeda antar platform; butuh layer normalisasi yang solid.
- **Idempotency** — proses sync yang retry/jalan dobel tidak boleh menduplikasi transaksi atau salah kurangi stok dua kali.
- **Downtime API pihak ketiga** — kalau Tokopedia/Shopee API down, sistem harus tetap jalan dan re-sync begitu API pulih (queue + retry, bukan sync yang gagal total).
- **Approval developer account** — Tokopedia dan Shopee mengharuskan proses registrasi/verifikasi partner sebelum API bisa dipakai produksi, ini perlu waktu dan biasanya perlu badan usaha terdaftar.
