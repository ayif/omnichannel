# Task Besok - Rekap Omnichannel

Catatan kerja untuk lanjutan development. Update file ini tiap kali task selesai/berubah.

## Quick Start

```bash
cd d:\omnichannel
docker compose up -d
docker compose exec backend npm run seed   # kalau butuh reset data contoh
```

- Dashboard: http://localhost:3001 (login: `admin@rekap.local` / `admin123`, `staf@rekap.local` / `staf12345`, atau `gudang@rekap.local` / `gudang123`)
- API: http://localhost:3000
- Adminer (lihat isi DB): http://localhost:8080

## Status Saat Ini (sudah selesai)

- [x] Scaffold backend (NestJS + TypeORM + BullMQ + Docker) & frontend (Next.js 16 + shadcn/ui)
- [x] Dashboard tersambung ke data asli dari Postgres (bukan mock lagi)
- [x] Autentikasi JWT (login/logout, proxy.ts guard, pola BFF route handler)
- [x] Infrastruktur multi-toko dinamis: tabel `channel_accounts`, OAuth connect/disconnect untuk Tokopedia & Shopee, token terenkripsi
- [x] Channel TikTok Shop ditambahkan (scaffold, kredensial belum diisi) - lihat poin backlog paling atas
- [x] Logo asli marketplace (Tokopedia/Shopee/TikTok Shop) di panel "Perbandingan Channel" dashboard
- [x] Poles UI (2026-08-04) - lihat detail di bawah

### Poles UI — SELESAI (2026-08-04)
- [x] Toast notification (`sonner`) buat aksi Hubungkan/Putuskan Toko & Sync Manual - sebelumnya cuma spinner diam, sekarang ada konfirmasi sukses/gagal. Banner connect/error di `/sinkronisasi` diganti toast (`connect-status-toast.tsx`) daripada banner permanen di halaman.
- [x] Konfirmasi "Putuskan Toko" ganti dari `confirm()` bawaan browser ke `AlertDialog` shadcn/Base UI.
- [x] Komponen `EmptyState` dipakai di tabel Transaksi, Produk, dan widget "Transaksi Terbaru" - tidak lagi nampilin tabel kosong polos kalau data nihil.
- [x] Search box di header (`SiteHeader`) yang sebelumnya cuma dekorasi (tidak nyambung ke apa pun) **dihapus**, diganti search kontekstual langsung di halaman Produk & Transaksi (nyambung ke filter beneran).
- [x] Sort kolom (klik header) + pagination client-side ditambah di tabel Produk & Transaksi (`produk-table.tsx`, `transaksi-table.tsx`, komponen shared `sortable-th.tsx` & `table-pagination.tsx`).
- [x] `loading.tsx` skeleton per halaman dashboard (Dashboard/Produk/Transaksi/Sinkronisasi) - sebelumnya navigasi antar halaman blank/freeze sampai data selesai di-fetch server-side.
- [x] Halaman login dipoles - panel branding split-screen di layar besar (tagline + 3 fitur utama), form tetap sama di layar kecil.
- [x] Favicon diganti (`app/icon.svg`, ikon toko warna brand) - **catatan**: sempat ke-block middleware auth (`proxy.ts` redirect ke `/login` buat request unauthenticated), sudah diperbaiki dengan nambah `icon.svg` ke matcher exclude.
- [x] Font heading (`font-heading`) dicek - sudah konsisten by default lewat komponen `CardTitle` bersama, tidak perlu perubahan.
- [ ] **Catatan penting**: `next build` (production build) saat ini **gagal** dengan error `Cannot read properties of null (reading 'useContext')` saat prerendering statis - dikonfirmasi BUKAN disebabkan perubahan hari ini (dicoba tanpa `Toaster`, tanpa `AlertDialog`, error tetap muncul, cuma pindah-pindah halaman tergantung urutan worker). Kemungkinan besar isu Next.js 16.2.12 + Turbopack + React 19 yang masih sangat baru (lihat peringatan di `frontend/AGENTS.md`). **Belum masalah sekarang** karena docker-compose jalanin `npm run dev`, bukan `next build && next start` - tapi kalau nanti mau deploy production beneran, ini harus diselesaikan dulu (coba downgrade Next/Turbopack, atau tunggu patch, atau ganti ke `next build` non-Turbopack kalau opsinya ada).

## Prioritas Berikutnya (pilih salah satu buat mulai)

### 1. RBAC per role — SELESAI (2026-08-04)
Kolom `role` (admin/staff/gudang) sekarang dipakai buat batasi akses.

Definisi akses yang dipakai:
- **admin & staff**: akses penuh — dashboard, transaksi, sync-logs (lihat + trigger manual), channel-accounts (lihat, connect, disconnect), produk.
- **gudang**: cuma `GET /products` (lihat produk & stok). Semua endpoint lain (dashboard, transaksi, sync, channel-accounts) ditolak 403.

Yang dikerjakan:
- [x] Backend: `@Roles(...)` decorator (`backend/src/modules/auth/roles.decorator.ts`) + `RolesGuard` (`backend/src/modules/auth/roles.guard.ts`), didaftarkan global sebagai `APP_GUARD` kedua di `auth.module.ts` (jalan setelah `JwtAuthGuard`). Guard otomatis skip kalau route `@Public()`.
- [x] Dipasang `@Roles(Role.ADMIN, Role.STAFF)` di level controller: `channel-accounts`, `dashboard`, `sync-logs`, `transactions`. `products` sengaja dibiarkan tanpa decorator (kebuka buat semua role login termasuk gudang).
- [x] Frontend: `app-sidebar.tsx` filter `NAV_ITEMS` berdasarkan role — gudang cuma lihat menu "Produk & Stok".
- [x] Frontend: proteksi akses URL langsung — halaman Dashboard/Transaksi/Sinkronisasi redirect gudang ke `/produk` (server component, cek `getCurrentUser()` di awal tiap page).
- [x] Backend build (`nest build`) & frontend typecheck (`tsc --noEmit`) lolos.
- [x] Smoke test live via Docker (2026-08-04): ditambah user seed `gudang@rekap.local` / `gudang123` biar role gudang bisa dites. Dicek langsung lewat HTTP: gudang dapat 403 di `/dashboard/stats`, `/transactions`, `/sync-logs`, `/channel-accounts` (cuma `/products` yang 200); sidebar gudang cuma render menu "Produk & Stok"; akses langsung ke `/`, `/transaksi`, `/sinkronisasi` redirect ke `/produk`. Staf tetap full akses ke semua endpoint & menu termasuk tombol "Hubungkan Toko". Semua sesuai definisi akses di atas.

### 2. Webhook channel Website
Channel "Website" sekarang cuma ada di seed data (dummy, selalu status gagal) - belum ada jalur data asli sama sekali.
- [ ] Endpoint `POST /webhooks/website` (dengan secret key/signature verification) buat terima notifikasi order baru dari website sendiri
- [ ] Normalisasi payload → insert ke `transactions` (idempotent, sama pola dengan SyncProcessor)
- [ ] Update `sync_logs` tiap webhook masuk

### 3. Migrasi database production-ready
`TypeOrmModule` masih pakai `synchronize: true` (auto-sync schema) - berisiko kalau nanti deploy ke production.
- [ ] Setup TypeORM migration (`typeorm migration:generate`/`:run`)
- [ ] Matikan `synchronize` di production, jalankan migration di startup/CI

### 4. Export rekap ke Excel — SELESAI (2026-08-05)
Disebut di dokumen teknis awal (`redme/Penjelasan-Teknis-Aplikasi-Rekap-Penjualan.md` bagian 6). Excel digarap, PDF belum (belum ada permintaan konkret formatnya seperti apa - lihat catatan di bawah).
- [x] Backend: `GET /transactions/export` (`backend/src/modules/transactions/transactions.controller.ts` + `.service.ts`), pakai `exceljs`. Query param opsional `channel`, `startDate`, `endDate`. Guard `@Roles(ADMIN, STAFF)` diwarisi dari controller (gudang tetap 403, sama seperti endpoint transaksi lain).
- [x] Workbook 3 sheet: "Detail Transaksi" (baris per transaksi), "Rekap per Channel" (total qty & omzet), "Rekap per Produk" (total qty, omzet, rata-rata harga jual) - sesuai poin 6 di dokumen teknis.
- [x] `TransactionsService.findAll` juga ketambahan filter `startDate`/`endDate` (dipakai bareng sama query builder export, belum dipakai di UI tabel transaksi - masih client-side filter semua).
- [x] Frontend: proxy route `frontend/src/app/api/transactions/export/route.ts` (pola sama seperti route BFF lain - baca token dari cookie httpOnly, teruskan sebagai Authorization header ke backend, stream balik `arrayBuffer` dengan header `Content-Type`/`Content-Disposition` asli dari backend).
- [x] Frontend: tombol "Export Excel" di header card "Riwayat Transaksi" (`/transaksi`) - buka `Sheet` (drawer) berisi filter Tanggal Mulai/Akhir + Channel, submit trigger download lewat `window.location.href` ke proxy route (browser handle attachment download otomatis, tidak pindah halaman). Komponen: `frontend/src/components/dashboard/export-transaksi-sheet.tsx`.
- [x] Smoke test live via Docker (2026-08-05): endpoint backend dites langsung (200 + file `.xlsx` valid dibuka pakai `exceljs`, isi 3 sheet benar), filter `channel=shopee` 200, gudang 403, tanpa token 401. Proxy route frontend dites lewat cookie session asli (login → export dengan `startDate`/`endDate` → 200 + xlsx valid) dan halaman `/transaksi` render tombol "Export Excel" tanpa error.
- [ ] **Catatan dev**: file route baru (`api/transactions/export/route.ts`) sempat tidak kedeteksi Turbopack dev server (404) sampai container `frontend` di-restart - kemungkinan sama dengan isu Next 16.2.12+Turbopack yang sudah dicatat di atas (bukan bug di kode). Kalau nambah route baru lagi dan dapat 404 padahal file sudah benar, coba `docker compose restart frontend` dulu.
- [ ] PDF belum digarap - kalau dibutuhkan, tinggal tambah lib sejenis (`pdfkit`/`puppeteer`) dan endpoint serupa, bisa reuse query filter yang sama.
- [ ] Export di halaman Dashboard belum ditambah (cuma di Transaksi) - gampang ditambah tinggal reuse `ExportTransaksiSheet` kalau dibutuhkan.

## Backlog (belum urgent, dicatat biar tidak lupa)

- [ ] Channel **TikTok Shop** ditambahkan (2026-08-04), scaffold lengkap tapi kredensial kosong sama seperti Tokopedia/Shopee:
  - `Channel.TIKTOKSHOP` di enum (backend `common/channel.enum.ts` & frontend `lib/types.ts`), sudah kepasang di semua tempat yang butuh (dashboard trend/totals, sync scheduler tiap 10 menit, sinkronisasi page, filter tab transaksi, warna kategorikal `--chan-tiktokshop` slot ke-4 di `globals.css` - tervalidasi CVD-safe pakai skill dataviz).
  - `TikTokShopService` (`backend/src/modules/channels/tiktokshop/tiktokshop.service.ts`) - stub `fetchNewOrders`/`updateStock`, mirip persis Tokopedia/Shopee.
  - `TikTokShopOAuthProvider` (`backend/src/modules/channels/oauth/tiktokshop-oauth.provider.ts`) - alur OAuth + sign HMAC-SHA256 (app_key/app_secret), **URL & skema sign masih PLACEHOLDER** (belum diverifikasi ke TikTok Shop Partner Center Developer Portal), env var: `TIKTOKSHOP_APP_KEY`, `TIKTOKSHOP_APP_SECRET`, `TIKTOKSHOP_AUTHORIZE_URL`, `TIKTOKSHOP_BASE_URL` di `backend/.env`.
  - **Penting**: hasil riset (2026-08-04) - Tokopedia Open API yang lama **sedang di-*terminate*** oleh TikTok; integrasi Tokopedia baru pun sekarang diarahkan lewat **TikTok Shop Partner Center API** yang sama. Jadi begitu kredensial TikTok Shop Partner Center didapat, `TikTokShopOAuthProvider`/`TikTokShopService` berpotensi jadi jalur integrasi buat Tokopedia **dan** TikTok Shop sekaligus - lihat juga catatan di `tokopedia-oauth.provider.ts`.
  - Sudah smoke test live: `GET /channel-accounts/tiktokshop/connect` generate authorize URL, `POST /sync-logs/tiktokshop/trigger` diproses worker tanpa error (skip karena belum ada toko terhubung), UI sinkronisasi/transaksi/dashboard semua render "TikTok Shop" dengan benar.
- [ ] Gambar produk di halaman `/produk` - **SIAP TAPI KOSONG (2026-08-04)**: kolom `products.gambar_url` (nullable) + UI thumbnail (fallback ikon kalau null) sudah ada (`ProductThumbnail` di `frontend/src/components/dashboard/product-thumbnail.tsx`). Belum ada isinya karena narik gambar asli butuh integrasi katalog produk marketplace yang sama-sama terblokir kredensial (lihat poin di atas & di bawah). Begitu `fetchNewOrders`/sejenisnya jalan, tinggal isi `gambarUrl` pas sync produk.
- [ ] Implementasi asli `TokopediaService.fetchNewOrders`/`updateStock` - **terblokir**: butuh kredensial partner asli. Tokopedia Open API lama sedang di-terminate - integrasi baru kemungkinan besar lewat TikTok Shop Partner Center (lihat poin TikTok Shop di atas), bukan lewat `tokopedia-oauth.provider.ts` yang sudah ada
- [ ] Implementasi asli `ShopeeService.fetchNewOrders`/`updateStock` - terblokir butuh `partner_id`/`partner_key` asli dari Shopee Open Platform
- [ ] Implementasi asli `TikTokShopService.fetchNewOrders`/`updateStock` - terblokir butuh app_key/app_secret asli dari TikTok Shop Partner Center + verifikasi URL/skema sign yang masih placeholder
- [ ] `product_channel_mapping` belum di-scope per toko (`shop_id`) - baru masalah nyata kalau ada >1 toko aktif per channel sekaligus
- [ ] Verifikasi `state` param OAuth (saat ini digenerate tapi tidak disimpan/divalidasi saat callback - CSRF protection minimal)
- [ ] Rotasi `JWT_SECRET` & `TOKEN_ENCRYPTION_KEY` di `backend/.env` - masih placeholder, jangan dipakai apa adanya kalau sudah mau ke production
- [ ] Automated tests (unit + e2e) - belum ada sama sekali
- [ ] CI pipeline (lint + build + test on push)

## Referensi

- Dokumen arsitektur asli: `redme/Penjelasan-Teknis-Aplikasi-Rekap-Penjualan.md`
- Panduan Docker: `redme/Panduan-Memulai-Project-dengan-Docker.md`
