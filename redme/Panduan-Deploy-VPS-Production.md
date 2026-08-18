# Panduan Deploy ke VPS (Production)

Asumsi: kamu sudah punya VPS (bisa SSH masuk) dan domain yang sudah/akan diarahkan ke IP VPS itu.

## 1. Arsitektur Production

Berbeda dari `docker-compose.yml` (dev, live-reload), production pakai `docker-compose.prod.yml`:

- **postgres**, **redis** — sama seperti dev, tapi TIDAK dipublish ke internet (cuma bisa diakses container lain di jaringan Docker internal).
- **backend**, **worker** — build target `production` (kode ter-compile ke `dist/`, tanpa dev dependencies). Juga tidak dipublish langsung ke internet.
- **frontend** — build target `production`. Juga tidak dipublish langsung.
- **caddy** — reverse proxy yang satu-satunya container yang dengar di port 80/443. Otomatis urus sertifikat HTTPS (Let's Encrypt) begitu domain sudah diarahkan ke VPS.

Alur request: `browser → Caddy (HTTPS) → frontend → backend (internal)`. Backend tidak pernah diakses langsung dari internet — semua panggilan API dari browser lewat proxy `/api/*` yang sudah ada di frontend (lihat `frontend/src/app/api/`), jadi tidak perlu buka port backend ke publik sama sekali.

## 2. Persiapan DNS

Arahkan domain (A record) ke IP publik VPS:

```
A    domain-kamu.com    ->  <IP VPS>
```

Tunggu sampai propagasi selesai (cek dengan `nslookup domain-kamu.com` atau https://dnschecker.org) sebelum lanjut ke langkah 5 — Caddy butuh domain sudah bisa di-resolve supaya berhasil minta sertifikat dari Let's Encrypt.

## 3. Siapkan VPS

SSH ke VPS, lalu install Docker + Docker Compose plugin (kalau belum ada):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# logout/login ulang supaya grup docker aktif
```

Clone repo ke VPS:

```bash
git clone <url-repo-kamu> rekap-omnichannel
cd rekap-omnichannel
```

## 4. Isi Environment Variables

Ada **dua** file env yang dibutuhkan:

### a) `.env` di root project

Dipakai `docker-compose.prod.yml` untuk kredensial database & domain Caddy:

```bash
cat > .env <<'EOF'
DB_USER=rekap_user
DB_PASSWORD=<ganti-password-kuat>
DB_NAME=rekap_db
DOMAIN=domain-kamu.com
EOF
```

### b) `backend/.env`

Dipakai container `backend` & `worker`. **Wajib diganti dari nilai dev**, jangan copy apa adanya:

```bash
cp backend/.env.example backend/.env   # kalau belum ada, buat manual sesuai daftar di bawah
```

Isi minimal yang **harus** diganti (jangan pakai placeholder):

```bash
# generate secret acak yang panjang untuk masing-masing baris ini
openssl rand -hex 32
```

- `JWT_SECRET` — dari `openssl rand -hex 32`. **Kalau ini dibiarkan nilai default `ganti_dengan_random_string_yang_panjang`, siapa pun bisa memalsukan token login admin.**
- `TOKEN_ENCRYPTION_KEY` — dari `openssl rand -hex 32` (baris terpisah, jangan sama dengan `JWT_SECRET`). Dipakai enkripsi access/refresh token toko yang tersimpan di database.
- `BACKEND_PUBLIC_URL` → `https://domain-kamu.com` (dipakai untuk redirect OAuth marketplace)
- `FRONTEND_PUBLIC_URL` → `https://domain-kamu.com`
- Kredensial `TOKOPEDIA_*` / `SHOPEE_*` / `TIKTOKSHOP_*` — isi kalau sudah daftar developer account channel tersebut. Boleh dikosongkan dulu kalau belum, fitur sinkronisasi channel itu tinggal tidak dipakai sampai diisi.

## 5. Build & Jalankan

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ini akan build image backend/frontend (target production) dan menyalakan semua service. Caddy otomatis coba minta sertifikat HTTPS untuk `DOMAIN` yang diisi di `.env` — pastikan langkah 2 (DNS) sudah beres duluan, kalau belum Caddy akan retry sendiri sampai berhasil.

Cek semua container sehat:

```bash
docker compose -f docker-compose.prod.yml ps
```

## 6. Jalankan Migration Database (WAJIB, sekali di awal)

Database production **tidak** auto-buat tabel seperti di dev (`synchronize` mati saat `NODE_ENV=production`, demi keamanan skema). Skema dibuat lewat migration:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run migration:run:prod
```

Tanpa langkah ini, aplikasi akan error begitu ada query pertama karena tabel belum ada.

## 7. (Opsional) Buat Akun Admin Pertama

Tidak ada endpoint publik untuk daftar akun — akun pertama harus dibuat manual lewat database, misalnya:

```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U rekap_user -d rekap_db
```

```sql
-- Ganti email & hash password (generate hash bcrypt dulu, jangan simpan plain text)
INSERT INTO users (email, password_hash, nama, role)
VALUES ('admin@domain-kamu.com', '<bcrypt-hash>', 'Admin', 'admin');
```

Cara paling gampang generate bcrypt hash-nya, dari komputer lokal (folder `backend/`):

```bash
node -e "console.log(require('bcryptjs').hashSync('password-kamu', 10))"
```

## 8. Verifikasi

Buka `https://domain-kamu.com` di browser — harus tampil halaman login dengan sertifikat HTTPS valid. Coba login pakai akun admin dari langkah 7.

## 9. Redeploy Setelah Ada Perubahan Kode

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Kalau ada perubahan struktur data (entity) sejak deploy terakhir, generate & jalankan migration barunya **sebelum** deploy (biar bisa direview dulu), lalu setelah container backend baru jalan:

```bash
# di komputer lokal, setelah ubah entity:
cd backend && npm run migration:generate -- src/database/migrations/NamaPerubahan

# di VPS, setelah git pull & up -d --build:
docker compose -f docker-compose.prod.yml exec backend npm run migration:run:prod
```

## 10. Backup Database

Data Postgres tersimpan di Docker volume `postgres_data`. Backup manual:

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U rekap_user rekap_db > backup-$(date +%Y%m%d).sql
```

Sebaiknya dijadwalkan (cron) dan disalin ke tempat lain di luar VPS (jangan cuma tersimpan di VPS yang sama).

## 11. Catatan Keamanan

- Jangan expose port Postgres (5432) atau Redis (6379) ke publik — di `docker-compose.prod.yml` memang sudah sengaja tidak di-publish, jangan ditambahkan `ports:` untuk mereka.
- Adminer (GUI database) sengaja tidak diikutkan di production. Kalau perlu lihat isi database, pakai `docker compose exec postgres psql ...` di atas, atau bikin SSH tunnel ke port 5432 kalau memang perlu GUI, jangan expose langsung.
- `backend/.env` dan `.env` (root) berisi secret — pastikan permission file-nya tidak bisa dibaca user lain (`chmod 600 .env backend/.env`), dan jangan pernah di-commit ke git (sudah ada di `.gitignore`).
