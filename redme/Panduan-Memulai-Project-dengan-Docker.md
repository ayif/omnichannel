# Panduan Memulai Project dengan Docker

Stack: Node.js/TypeScript (backend) + Next.js (frontend) + PostgreSQL + Redis, dikemas dengan Docker Compose.

## 1. Struktur Folder

```
rekap-marketplace/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── ...
```

File yang sudah dibuat di outputs (pindahkan sesuai nama & lokasi berikut):

- `docker-compose.yml` → taruh di root project.
- `backend.Dockerfile` → rename jadi `Dockerfile`, taruh di dalam folder `backend/`.
- `frontend.Dockerfile` → rename jadi `Dockerfile`, taruh di dalam folder `frontend/`.
- `.env.example` → salin jadi `.env` di root project, isi kredensial yang masih kosong.

## 2. Prasyarat

- Docker Desktop / Docker Engine + Docker Compose sudah terinstall.
- Belum perlu install Node.js di komputer lokal — semua jalan di dalam container.

## 3. Inisialisasi Project

```bash
mkdir rekap-marketplace && cd rekap-marketplace
mkdir backend frontend

# copy docker-compose.yml, .env.example ke root
# copy backend.Dockerfile -> backend/Dockerfile
# copy frontend.Dockerfile -> frontend/Dockerfile

cp .env.example .env
```

Inisialisasi backend (di dalam folder `backend/`), contoh pakai NestJS:

```bash
cd backend
npm init -y
npx @nestjs/cli new . --skip-install
npm install pg ioredis bullmq typeorm @nestjs/typeorm dotenv
cd ..
```

Inisialisasi frontend (di dalam folder `frontend/`):

```bash
npx create-next-app@latest frontend --typescript
```

Pastikan `package.json` backend punya script berikut (dipakai oleh `docker-compose.yml`):

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/main.ts",
    "worker": "ts-node-dev --respawn src/worker.ts",
    "build": "tsc -p tsconfig.json"
  }
}
```

## 4. Menjalankan Semua Service

Dari root project:

```bash
docker compose up --build
```

Perintah ini akan menyalakan lima container:

- `rekap_postgres` — database, port 5432
- `rekap_redis` — queue/cache, port 6379
- `rekap_backend` — API server, port 3000
- `rekap_worker` — proses background untuk sync Tokopedia/Shopee & update stok
- `rekap_frontend` — dashboard, port 3001
- `rekap_adminer` — GUI untuk lihat isi database, port 8080

Cek semua service jalan:

```bash
docker compose ps
```

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
docker compose down -v       # stop + hapus volume (reset database & redis total)
```

## 9. Menuju Production

Untuk deploy, ubah target build di `docker-compose.yml` (atau buat `docker-compose.prod.yml` terpisah) dari `target: development` ke `target: production`, dan hilangkan volume mount source code — supaya container pakai kode hasil build (`dist/`), bukan live-reload.

## 10. Checklist Sebelum Mulai Coding Fitur Integrasi

- [ ] Daftar developer account di Tokopedia Developer Portal & Shopee Open Platform, isi `TOKOPEDIA_*` dan `SHOPEE_*` di `.env`.
- [ ] Buat modul/service terpisah per channel (`TokopediaService`, `ShopeeService`) di backend supaya integrasi tiap platform terisolasi.
- [ ] Setup queue (BullMQ) di `worker` untuk job sync order & update stok, sesuai desain di dokumen arsitektur sebelumnya.
