# Panduan Memulai Project dengan Docker

Stack: Node.js/TypeScript (backend) + Next.js (frontend) + PostgreSQL + Redis + n8n, dikemas dengan Docker Compose untuk development lokal.

## 1. Clone Repository

Clone repository, lalu jalankan perintah dari folder project:

```powershell
git clone https://github.com/ayif/omnichannel.git
Set-Location omnichannel
```

## 2. Prasyarat

- Docker Desktop / Docker Engine + Docker Compose sudah terinstall.
- Belum perlu install Node.js di komputer lokal — semua jalan di dalam container.

## 3. Konfigurasi lokal dan menjalankan aplikasi

Buat file environment lokal yang dibutuhkan. Perintah ini tidak menimpa file jika sudah ada:

```powershell
if (-not (Test-Path .env)) {
  Copy-Item redme\.env.example .env
}
if (-not (Test-Path backend\.env)) {
  Copy-Item backend\.env.example backend\.env
}
```

File `.env` root dipakai Docker Compose, sedangkan `backend/.env` dipakai backend dan worker. Samakan `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` di kedua file. Ganti placeholder secret di file environment lokal; jangan commit atau membagikan file tersebut.

## 4. Menjalankan Semua Service

Jalankan dari root project:

```powershell
docker compose up -d --build
docker compose ps -a
```

Compose menyalakan service berikut:

- `rekap_postgres` — database aplikasi dan database n8n, port 5432
- `rekap_redis` — queue/cache, port 6379
- `rekap_backend` — API server, port 3000
- `rekap_worker` — proses background untuk sync order dan update stok
- `rekap_frontend` — dashboard, port 3001
- `rekap_adminer` — GUI database, port 8080
- `rekap_n8n` — automation editor, lokal di `http://localhost:5678`
- `rekap_n8n_db_init` — menyiapkan database/user n8n, lalu selesai dengan exit code 0

Untuk n8n, ikuti langkah secret dan catatan volume di [Panduan n8n Docker](./Panduan-N8N-Docker.md).

Alamat aplikasi: frontend `http://localhost:3001`, Adminer `http://localhost:8080`, dan n8n `http://localhost:5678`.

## 5. Menjalankan Migrasi Database

Setelah container backend jalan, masuk ke container untuk menjalankan migrasi (contoh dengan TypeORM):

```bash
docker compose exec backend npm run migration:run
```

## 6. Melihat Log

```bash
docker compose logs -f backend
docker compose logs -f worker
```

## 7. Alur Kerja Harian saat Development

- Ubah kode di `backend/src` atau `frontend/` di komputer lokal seperti biasa — perubahan otomatis ter-reload di container karena volume mount + `ts-node-dev`/Next.js dev server.
- Kalau menambah dependency baru (`npm install ...`), jalankan di dalam container supaya `node_modules` di container ikut update:

```bash
docker compose exec backend npm install nama-package
docker compose restart backend
```

- Untuk cek database lewat browser: buka `http://localhost:8080` (Adminer), login pakai kredensial dari `.env`.

## 8. Mematikan Environment

```bash
docker compose down          # stop semua container, data volume tetap ada
docker compose down -v       # HAPUS database, Redis, dan data n8n secara permanen
```

## 9. Menuju Production

Untuk deploy, ubah target build di `docker-compose.yml` (atau buat `docker-compose.prod.yml` terpisah) dari `target: development` ke `target: production`, dan hilangkan volume mount source code — supaya container pakai kode hasil build (`dist/`), bukan live-reload.

## 10. Checklist Sebelum Mulai Coding Fitur Integrasi

- [ ] Daftar developer account di Tokopedia Developer Portal & Shopee Open Platform, isi `TOKOPEDIA_*` dan `SHOPEE_*` di `.env`.
- [ ] Buat modul/service terpisah per channel (`TokopediaService`, `ShopeeService`) di backend supaya integrasi tiap platform terisolasi.
- [ ] Setup queue (BullMQ) di `worker` untuk job sync order & update stok, sesuai desain di dokumen arsitektur sebelumnya.

## 11. Menjalankan n8n untuk Development

Untuk menyiapkan n8n di perangkat baru, membuat konfigurasi lokal yang dibutuhkan, dan membuka editor di `http://localhost:5678`, ikuti [Panduan n8n Docker](./Panduan-N8N-Docker.md). Jangan commit file `.env` atau `backend/.env`; keduanya berisi konfigurasi lokal dan secret.
