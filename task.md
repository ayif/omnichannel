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

### 5. Menu Akuntansi (Laporan Laba Rugi) — SELESAI (2026-08-10)
Rekap transaksi sudah ada, tapi belum ada laporan keuangan (P&L). Ditambah modul `accounting` yang hitung Laba Kotor dari data yang sudah ada (tanpa tabel baru) - `Omzet - HPP (harga_dasar produk) = Laba Kotor`.
- [x] Backend: modul baru `backend/src/modules/accounting/` (`accounting.service.ts` + `.controller.ts` + `.module.ts`), didaftarkan di `app.module.ts`. Endpoint `GET /accounting/laba-rugi` (query opsional `channel`/`startDate`/`endDate`) & `GET /accounting/laba-rugi/export` (xlsx, 4 sheet: Ringkasan, Rekap per Channel, Rekap per Produk, Tren Bulanan). Guard `@Roles(ADMIN, STAFF)` - sama seperti dashboard/transaksi, gudang tetap 403.
- [x] **Keputusan bisnis penting (jangan tanya ulang)**: status transaksi yang dihitung sebagai pendapatan valid = `paid`, `shipped`, `completed` (exclude `pending`, `cancelled`, `refund`). HPP dihitung dari `products.harga_dasar * qty` per transaksi (bukan snapshot harga saat transaksi terjadi - kalau `harga_dasar` produk diubah, laporan periode lama ikut berubah nilainya kalau di-generate ulang; belum ada histori harga modal).
- [x] Frontend: halaman baru `/akuntansi` (`frontend/src/app/(dashboard)/akuntansi/page.tsx`) - 4 StatCard (Total Pendapatan, HPP, Laba Kotor, Margin), chart tren bulanan (`laba-rugi-trend-chart.tsx`), tabel per channel (`laba-rugi-channel-table.tsx`), tabel per produk sortable+pagination (`laba-rugi-produk-table.tsx`), filter tanggal/channel lewat URL search params (`akuntansi-filter.tsx`), export Excel (`export-laba-rugi-sheet.tsx` + proxy route `api/accounting/export/route.ts`). Menu "Akuntansi" ditambah di sidebar (ikon `Calculator`), akses admin+staff sama seperti Transaksi (gudang redirect ke `/produk`).
- [x] Scope sengaja dibatasi ke Laba Rugi dari data penjualan saja (user pilih opsi ini secara eksplisit) - **belum ada** pencatatan biaya operasional manual (gaji, sewa, dll), jadi "Laba Kotor" di sini bukan "Laba Bersih" beneran. Kalau nanti dibutuhkan, perlu tabel `expenses` baru + CRUD + masuk ke perhitungan laba bersih.

### 6. Fitur "premium" — Fase 1: Audit Log — SELESAI (2026-08-10)
Bagian dari rangkaian 5 fitur premium yang disepakati (urutan: **Audit Log → Notifikasi In-App → Export PDF → Command Palette → Real-time WebSocket**, satu-satu dengan review tiap fase). Fase ini: catatan siapa melakukan apa & kapan.
- [x] Backend: entity baru `AuditLog` (tabel `audit_logs`) + modul `backend/src/modules/audit-log/` (`GET /audit-logs`, `@Roles(ADMIN)` **saja** - lebih ketat dari modul lain karena isinya jejak semua orang termasuk staf).
- [x] Hook pencatatan di 3 titik mutasi nyata yang ada di aplikasi ini (disurvei lewat grep `@Post|@Delete|@Patch|@Put` ke semua controller - cuma ada 3): `POST /auth/login` (sukses & gagal), `DELETE /channel-accounts/:id` (putus toko), `POST /sync-logs/:channel/trigger` (sync manual). Juga dicatat: koneksi toko sukses lewat `GET /channel-accounts/:channel/callback` (endpoint `@Public()` dipanggil browser toko via redirect OAuth - jadi aktor dicatat `null`/"Sistem" karena belum ada pemetaan OAuth state → user, ini backlog terpisah, lihat poin state OAuth di bawah).
- [x] Frontend: halaman baru `/log-aktivitas` (menu "Log Aktivitas" di sidebar, **admin-only** - beda dari menu lain yang admin+staff bisa akses). Tabel dengan search, badge per jenis aksi, filter tanggal/aksi lewat URL search params.
- [x] Smoke test via Docker (2026-08-10): login gagal → entri `login_failed`; login sukses → `login_success` dengan nama user; sync trigger manual → `sync_trigger` dengan aktor benar; staf dapat 403 di `GET /audit-logs`; staf & gudang akses `/log-aktivitas` langsung via URL redirect (staf → `/`, gudang → `/produk`); admin bisa lihat & filter.
- [ ] **Catatan dev**: sempat ke-trigger lagi isu Turbopack (dev server sempat 404-in route lama `/api/auth/login` setelah compile route baru `/log-aktivitas`) - sama seperti isu yang sudah dicatat di atas untuk `api/transactions/export/route.ts`, hilang setelah `docker compose restart frontend`. Pola ini kemungkinan besar akan terus muncul tiap kali nambah route API baru di dev - selalu restart frontend container setelah nambah file route baru dan test ulang.

### 7. Fitur "premium" — Fase 2: Notifikasi In-App — SELESAI (2026-08-10)
Lanjutan rangkaian 5 fitur premium (Fase 1 Audit Log sudah selesai; urutan lengkap: Audit Log → Notifikasi In-App → Export PDF → Command Palette → Real-time WebSocket). Fase ini: bell icon di `site-header.tsx` yang sebelumnya dekoratif (titik merah hardcoded) disambungkan ke data asli.
- [x] Backend: entity baru `Notification` (tabel `notifications`) + modul `backend/src/modules/notifications/` (`GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`) — **sengaja tanpa `@Roles(...)`**, semua role login (admin/staf/gudang) boleh akses (beda dari pola modul lain), karena gudang juga perlu tahu kalau sync gagal (mempengaruhi akurasi stok yang mereka kelola) dan tidak ada data sensitif di sini.
- [x] **Keputusan bisnis (jangan tanya ulang)**: status "sudah dibaca" **dibagikan bersama** (global), bukan per-akun - satu notification center bersama untuk semua user, sesuai pilihan user secara eksplisit.
- [x] Trigger notifikasi otomatis di 2 titik: `StockService.applyMovement()` (`backend/src/modules/stock/stock.service.ts`) untuk stok yang baru melewati `stokMinimum`, dan `SyncProcessor.handlePullOrders()` (`backend/src/modules/sync/sync.processor.ts`, jalan di proses `worker`) untuk channel yang gagal sync. Idempotent (tidak dobel notifikasi kalau kondisi tetap buruk) + **auto-resolve** (otomatis ditandai dibaca begitu stok direstock di atas minimum / sync sukses lagi).
- [x] Frontend: `frontend/src/components/notification-bell.tsx` (dropdown, badge unread count, polling tiap 45 detik, klik item nge-mark-read + navigasi ke halaman relevan), dipasang di `site-header.tsx` gantiin bell dekoratif lama.
- [x] Smoke test via Docker (2026-08-10): dites langsung lewat script yang manggil `StockService.applyMovement` (tidak ada endpoint HTTP buat adjust stok manual, dan integrasi marketplace asli masih terblokir kredensial - lihat backlog) - konfirmasi idempotency (2x turun di bawah minimum cuma bikin 1 notifikasi), auto-resolve (restock di atas minimum → `isRead: true` otomatis), endpoint `markRead`/`readAll` jalan, gudang dapat 200 (bukan 403) di `GET /notifications`. Data produk yang dipakai buat tes (`Earphone Bluetooth X1`) sudah dikembalikan ke stok semula (142) setelah tes.
- [ ] **Catatan**: notifikasi cuma dipicu oleh *transisi* status (baru lewat ambang batas), bukan dari state statis - beberapa produk seed yang sudah di bawah `stokMinimum` sejak awal (belum pernah lewat `applyMovement`) **tidak otomatis dapat notifikasi backfill**. Ini sesuai desain (dikonfirmasi jalan sesuai rencana), bukan bug - kalau nanti butuh notifikasi juga untuk produk yang sudah lama di bawah minimum, perlu scheduled job tambahan yang scan `stock` vs `stokMinimum` secara periodik.

### 8. Fitur "premium" — Fase 3: Export PDF Laporan Laba Rugi — SELESAI (2026-08-10)
Lanjutan rangkaian 5 fitur premium (Fase 1 Audit Log, Fase 2 Notifikasi In-App selesai; sisa: Command Palette → Real-time WebSocket). Fase ini: laporan Laba Rugi bulanan dalam PDF branded siap kirim ke owner/investor, pelengkap dari export Excel yang sudah ada di `/akuntansi`.
- [x] **Keputusan (jangan tanya ulang)**: scope PDF cuma "Laporan Bulanan" (ringkasan Laba Rugi) dulu, bukan invoice per-transaksi (beda dokumen/kebutuhan, bisa jadi fase terpisah nanti). Library `pdfkit` (Node murni, bukan Puppeteer) - dipilih user sengaja biar image Docker backend tidak nambah berat Chromium.
- [x] `pdfkit` + `@types/pdfkit` (devDependency) ditambah ke `backend/package.json` lewat `npm install` di container yang jalan (`node_modules` di-mount sebagai anonymous volume terpisah dari source - lihat `docker-compose.yml`).
- [x] Backend: `AccountingService.exportToPdf()` (`backend/src/modules/accounting/accounting.service.ts`) reuse `labaRugi()` yang sama persis dipakai versi Excel & halaman web - render header, ringkasan, tabel per channel, tabel per produk (**dibatasi 15 teratas** by laba kotor - laporan ringkas buat owner/investor, beda tujuan dari Excel yang memang data mentah), footer nomor halaman. Endpoint baru `GET /accounting/laba-rugi/export-pdf` (guard sama seperti export Excel: `ADMIN`+`STAFF`).
- [x] Frontend: tombol "Unduh PDF" ditambah di `ExportLabaRugiSheet` (`frontend/src/components/dashboard/export-laba-rugi-sheet.tsx`) di samping "Unduh Excel" yang sudah ada, reuse filter tanggal/channel yang sama. Proxy route `frontend/src/app/api/accounting/export-pdf/route.ts`.
- [x] Smoke test via Docker (2026-08-10): PDF valid 2 halaman (`file` command konfirmasi "PDF document, version 1.3"), isi teks diverifikasi lewat `pdftotext` cocok dengan data API (Total Pendapatan Rp41.972.000, dst - sama seperti Fase Akuntansi awal). Filter `channel=shopee` juga hasilkan PDF valid. Gudang 403. Lewat BFF (cookie asli) proxy route juga hasilkan PDF valid.

### 9. Fitur "premium" — Fase 4: Command Palette (Cmd+K) — SELESAI (2026-08-10)
Lanjutan rangkaian 5 fitur premium (Fase 1-3 selesai; sisa: Real-time WebSocket). Fase ini: Cmd+K/Ctrl+K buat lompat cepat ke menu & jalankan aksi umum tanpa mouse.
- [x] Dipakai `npx shadcn@latest add command` (project ini pakai shadcn CLI style `base-nova`/Base UI untuk semua komponen `ui/`) - nambah `ui/dialog.tsx`, `ui/input-group.tsx`, `ui/command.tsx` + dependency `cmdk`. CLI otomatis resolve import ikon ke `lucide-react` biasa sesuai `iconLibrary` di `components.json` (tidak ada import rusak dari template demo shadcn.com).
- [x] **Bug ditemukan & diperbaiki** di `frontend/src/components/ui/command.tsx`: `CommandDialog` hasil generate CLI **tidak** membungkus `{children}` dengan `<Command>` (root store cmdk) - bikin crash runtime `TypeError: Cannot read properties of undefined (reading 'subscribe')` begitu palette dibuka (children `CommandInput`/`CommandList`/dst butuh context dari `<Command>`). Ketauan lewat testing beneran di browser (Playwright, bukan cuma typecheck) - **pelajaran**: `tsc --noEmit` lolos tapi runtime tetap crash, jadi fitur UI interaktif harus dites jalan di browser asli, bukan cuma compile check.
- [x] `NAV_ITEMS` (sebelumnya inline di `app-sidebar.tsx`) dipindah ke `frontend/src/lib/nav-items.ts` - dipakai bareng oleh `AppSidebar` dan `CommandPalette` baru (satu sumber kebenaran, tidak dobel-maintain daftar menu).
- [x] Komponen baru `frontend/src/components/command-palette.tsx` - trigger tombol "Cari... ⌘K/Ctrl K" di header + listener keyboard global. Isi: grup "Menu" (nav item difilter role, sama seperti sidebar), grup "Aksi" (Sync Manual per channel, admin+staff saja - reuse endpoint yang sama dengan tombol Sync Manual di `/sinkronisasi`), grup "Tampilan" (ganti tema, reuse `next-themes`), grup "Akun" (Keluar).
- [x] `SiteHeader` diubah nerima prop `user` (sebelumnya tidak ada props sama sekali) buat filter menu sesuai role. Sekalian ditambah entry `/akuntansi` & `/log-aktivitas` ke `PAGE_TITLE` map yang sebelumnya belum lengkap.
- [x] Verifikasi end-to-end pakai Playwright manual (browser asli via `npx -p playwright node`, bukan cuma curl) karena ini fitur interaktif: login → Ctrl+K buka palette → ketik "Produk" → filter kerja → pilih → navigasi ke `/produk` → buka lagi → pilih "Mode Gelap" → tema berubah. Semua lolos, screenshot dicek visual (styling cocok light & dark). Role `gudang` cuma lihat grup "Menu" (Produk & Stok saja) tanpa grup "Aksi" (konsisten sidebar).

### 10. Modul Analisis Produk (Terlaris & Prediksi Stok Habis) — SELESAI (2026-08-10)
User minta modul "AI" buat tahu produk paling banyak dibeli & paling cepat habis per marketplace. Diklarifikasi dulu lewat AskUserQuestion sebelum dikerjakan.
- [x] **Keputusan (jangan tanya ulang)**: "AI" di sini = analisis statistik/ranking dari data yang sudah ada (bukan LLM/ML) - dipilih user secara eksplisit. Menu dinamai **"Analisis Produk"**, bukan "AI Insights", biar jujur soal kapabilitas.
- [x] Metrik **"paling banyak dicari"** (search/traffic marketplace) **sengaja di-skip total** (tidak ada stub) - itu data analitik internal Tokopedia/Shopee/TikTok Shop yang butuh integrasi API resmi (kredensial partner), masih terblokir sama seperti backlog integrasi marketplace lain yang sudah lama tercatat.
- [x] Backend: modul baru `backend/src/modules/analytics/` - `GET /analytics/produk-terlaris` (ranking qty terjual per produk, breakdown per channel, filter channel/tanggal) & `GET /analytics/stok-tercepat-habis` (proyeksi hari tersisa sebelum stok habis, dari kecepatan penjualan 30 hari terakhir). Guard `ADMIN`+`STAFF` (sama seperti Dashboard/Akuntansi).
- [x] **Detail teknis penting**: proyeksi stok habis dihitung dari `stock_movements` (`sumber='transaksi'`), **bukan** dari tabel `transactions` - karena `StockService.applyMovement()` (dipanggil `SyncProcessor` di `sync.processor.ts`) mengurangi stok untuk **setiap** order masuk tanpa filter status (stok langsung dikurangi begitu order masuk, cegah oversell), jadi ini catatan paling akurat soal kecepatan stok riil berkurang.
- [x] `REVENUE_STATUSES` (status transaksi yang dihitung penjualan valid) di-refactor dari inline di `AccountingService` ke `backend/src/common/transaction-status.util.ts` - dipakai bareng oleh Akuntansi & Analisis Produk (satu definisi, tidak dobel).
- [x] Frontend: halaman baru `/analisis-produk` (2 kartu: Produk Terlaris, Prediksi Stok Habis dengan badge urgensi warna - merah <7 hari, kuning <14 hari, hijau selebihnya). Menu ditambah cuma di `frontend/src/lib/nav-items.ts` - **otomatis muncul di sidebar DAN command palette sekaligus** (hasil refactor Fase 4 kemarin kepakai lagi di sini, tidak perlu ubah 2 tempat).
- [x] **Catatan penting soal data seed**: `seed.ts` insert `Transaction` & `Stock` langsung ke DB, **tidak lewat** `StockService.applyMovement()` - jadi `stock_movements` dari seed data kosong sama sekali (bukan bug di modul baru ini). Diverifikasi dengan simulasi manual (script yang manggil `applyMovement` dengan `sumber=TRANSAKSI` buat 2 produk, dicek hasil endpoint benar - Power Bank stok 2/rate 0.2 per hari = 10 hari, Earphone stok 52/rate 3 per hari = 17 hari, terurut benar), lalu stok dikembalikan ke nilai seed semula setelahnya.
- [x] Verifikasi end-to-end pakai Playwright (bukan cuma `tsc`/curl - sudah jadi kebiasaan sejak Fase 4 karena pernah ketemu bug runtime yang lolos typecheck): halaman render dengan benar, menu muncul di sidebar & command palette (Ctrl+K → ketik "Analisis" → ketemu), tidak ada console error. Screenshot dicek visual cocok dengan desain existing.

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
