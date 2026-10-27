# Menjalankan n8n secara lokal dengan Docker Compose

n8n berjalan sebagai container terpisah di jaringan Compose yang sama dengan aplikasi. Port editor hanya dipublikasikan ke komputer lokal di `http://localhost:5678`.

## Database dan penyimpanan

- n8n menggunakan service PostgreSQL `postgres` yang sudah ada.
- Database `n8n` dan user `n8n` dibuat terpisah dari database aplikasi melalui service sekali-jalan `n8n-db-init`.
- Pembuatan database/user aman diulang dan juga berlaku untuk volume PostgreSQL yang sudah ada.
- Credential dan data internal n8n disimpan di volume `n8n_data`.
- Jangan hapus `N8N_ENCRYPTION_KEY`: n8n memerlukannya untuk membaca credential yang tersimpan.
- PostgreSQL 16 pada project ini berada pada jalur dukungan kompatibilitas n8n; peringatan kompatibilitas saat startup tidak menghalangi penggunaan lokal.

## Menyiapkan perangkat baru dari repository

Lakukan langkah ini setelah clone repository. Jangan menimpa file `.env` yang sudah ada karena isinya menyimpan konfigurasi dan secret lokal.

1. Pastikan Docker Desktop berjalan dan Docker Compose tersedia.
2. Dari PowerShell di root repository, buat file konfigurasi lokal yang dibutuhkan Compose:

   ```powershell
   if (-not (Test-Path .env)) {
     Copy-Item redme\.env.example .env
   }
   if (-not (Test-Path backend\.env)) {
     Copy-Item backend\.env.example backend\.env
   }
   ```

   `.env` dipakai Docker Compose, sedangkan `backend/.env` dibaca oleh container backend dan worker. Kedua file diabaikan Git. Jika mengubah `DB_USER`, `DB_PASSWORD`, atau `DB_NAME`, samakan nilainya di kedua file.
3. Ganti placeholder `JWT_SECRET` dan `TOKEN_ENCRYPTION_KEY` di `backend/.env` dengan secret acak. Di file `.env` root, ganti `N8N_DB_PASSWORD` dan `N8N_ENCRYPTION_KEY` dengan dua nilai acak yang berbeda. Contoh membuat hex acak melalui PowerShell:

   ```powershell
   $bytes = New-Object byte[] 32
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   [System.BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
   $rng.Dispose()
   ```

   Jalankan terpisah untuk setiap nilai, lalu simpan ke file yang sesuai. Jangan commit atau membagikan file `.env`.
4. Jalankan seluruh development stack dari root repository:

   ```powershell
   docker compose up -d --build
   docker compose ps -a
   ```

5. Setelah container `n8n` berstatus `Up`, buka `http://localhost:5678` dan buat akun pemilik n8n saat diminta.

Jika startup gagal, periksa `docker compose logs n8n n8n-db-init backend`. `n8n-db-init` harus berstatus `Exited (0)` setelah membuat database dan user n8n.

## Jaringan Docker

- Dari n8n ke API NestJS: `http://backend:3000`
- Dari n8n ke PostgreSQL aplikasi: `postgres:5432` (untuk akses database langsung, gunakan user read-only terpisah; jangan gunakan user aplikasi untuk menulis).
- Dari browser host ke editor n8n: `http://localhost:5678`

Di dalam container, `localhost` menunjuk ke container itu sendiri. Karena itu gunakan nama service Compose untuk komunikasi antar-container.

## Perintah harian

```powershell
docker compose logs -f n8n
docker compose stop n8n
docker compose start n8n
```

`docker compose down` tidak menghapus volume n8n. Jangan gunakan `docker compose down -v` kecuali memang ingin menghapus data persisten seluruh stack, termasuk database aplikasi, Redis, dan data n8n. Saat pindah perangkat, volume Docker tidak ikut ter-clone dari Git; workflow, credential, dan akun n8n perlu dipindahkan melalui mekanisme export/backup n8n jika ingin mempertahankannya.

Konfigurasi ini ditujukan untuk development lokal, bukan deployment publik. Port n8n diikat ke loopback host dan tidak dapat diakses dari jaringan luar. `N8N_WEBHOOK_URL` saat ini menggunakan alamat localhost; webhook dari layanan eksternal memerlukan domain HTTPS, reverse proxy, autentikasi, dan konfigurasi URL yang sesuai.
