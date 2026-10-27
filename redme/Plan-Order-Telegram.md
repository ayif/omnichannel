# Rencana Development: Order Masuk ke Rekap dan Notifikasi Telegram

## Tujuan

Membangun dan menguji alur order end-to-end sebelum toko dan integrasi marketplace siap:

1. Order baru diterima atau disimulasikan.
2. Order divalidasi dan disimpan satu kali.
3. Stok diperbarui sesuai kebijakan aplikasi.
4. Notifikasi ringkas dikirim ke grup Telegram internal.
5. Order tampil di rekap aplikasi.

Integrasi Telegram pada tahap awal ditujukan untuk tim internal, bukan untuk menghubungi pelanggan.

## Kondisi project saat ini

- Entitas `Transaction` dan endpoint rekap transaksi sudah tersedia.
- Worker BullMQ dan queue sinkronisasi sudah digunakan untuk pekerjaan latar belakang.
- Sinkronisasi order dijadwalkan setiap 10 menit.
- Pemrosesan order hasil sinkronisasi memerlukan pemetaan produk dan menghindari duplikasi berdasarkan channel dan ID order.
- Integrasi pengambilan order Tokopedia, Shopee, dan TikTok Shop masih berupa stub. Beberapa implementasi `fetchNewOrders` belum mengambil data nyata.
- Seed database sudah mengisi transaksi contoh untuk tampilan rekap. Namun, seed menghapus data dari beberapa tabel sebelum mengisinya kembali; jangan jalankan pada database yang berisi data penting.
- Belum ada alur simulator order baru maupun integrasi pengiriman Telegram.

## Prinsip implementasi

- Simpan order terlebih dahulu; kegagalan Telegram tidak boleh menghapus atau membatalkan order.
- Gunakan worker/queue untuk mengirim notifikasi secara asinkron.
- Proses order dan notifikasi harus aman terhadap retry dan tidak menghasilkan transaksi atau pesan duplikat tanpa kendali.
- Pisahkan data uji dari data operasional. Gunakan database dan grup Telegram khusus untuk development.
- Jangan mengirim nama, alamat, nomor telepon, atau informasi pribadi pelanggan ke grup. Batasi pesan pada ringkasan operasional yang diperlukan.
- Jangan pernah menyimpan token bot di source control atau mengirimkannya ke frontend.

## Tahapan development

### Tahap 1 — Siapkan lingkungan uji yang aman

**Pekerjaan**

- Siapkan database lokal/test yang terpisah dari database yang digunakan bersama atau production.
- Buat bot Telegram melalui BotFather dan grup Telegram development.
- Tambahkan bot ke grup, tentukan chat ID grup, lalu simpan token dan chat ID hanya di environment backend.
- Pastikan konfigurasi Telegram tidak wajib untuk menjalankan aplikasi saat fitur notifikasi dinonaktifkan di development.
- Dokumentasikan cara menyiapkan konfigurasi tanpa mencantumkan token sebenarnya.

**Kriteria selesai**

- Developer dapat menjalankan stack lokal tanpa mengirim pesan ke grup production.
- Token tidak berada di frontend, file yang di-commit, log, maupun respons API.

### Tahap 2 — Buat simulator order development

**Pekerjaan**

- Tambahkan cara terkontrol untuk membuat satu order uji, misalnya endpoint development yang terlindungi atau perintah CLI.
- Batasi fitur simulasi agar tidak aktif pada production.
- Validasi channel, ID order, produk, jumlah, harga, ongkos kirim, dan status sebelum menerima order.
- Gunakan ID order unik yang mudah dikenali, misalnya `WEB-TEST-<id>`.
- Pakai jalur penyimpanan dan aturan idempotensi yang sama dengan order normal sejauh sesuai.
- Jalankan pengujian hanya pada database test. Tentukan secara eksplisit apakah simulasi ikut mengurangi stok dan memicu push stok; perilaku yang dipilih harus jelas di respons dan dokumentasi simulator.

**Kriteria selesai**

- Developer dapat membuat order uji tanpa toko atau kredensial marketplace.
- Pengiriman order uji yang sama berulang kali tidak membuat transaksi duplikat.
- Simulator tidak dapat dipakai untuk mengubah data production.

### Tahap 3 — Tambahkan pengiriman notifikasi Telegram

**Pekerjaan**

- Tambahkan job notifikasi pada queue worker setelah transaksi order berhasil disimpan.
- Kirim pesan yang ringkas, misalnya channel, nomor order, jumlah barang, total, dan tautan ke aplikasi bila tersedia.
- Jangan mengirim data pribadi pelanggan atau payload mentah marketplace.
- Simpan status pengiriman (menunggu, terkirim, gagal), waktu percobaan, dan pesan kesalahan yang sudah disanitasi. Gunakan tabel/entitas baru atau mekanisme yang sesuai dengan pola database project.
- Terapkan retry terbatas dengan jeda bertahap. Pastikan error Telegram tidak membuat proses penyimpanan order gagal.
- Cegah pesan ganda saat job diulang. Tentukan kunci idempotensi yang mengaitkan notifikasi dengan transaksi dan jenis notifikasi.

**Kriteria selesai**

- Order tersimpan dan tampil di rekap walaupun Telegram sedang tidak tersedia.
- Job dapat mencoba ulang kegagalan sementara dan statusnya dapat ditelusuri.
- Retry tidak mengirim pesan ganda tanpa sengaja.
- Pesan hanya dikirim ke grup uji yang dikonfigurasi.

### Tahap 4 — Uji alur end-to-end dengan data dummy

**Skenario uji**

1. Buat order uji baru dan pastikan transaksi tersimpan serta tampil di rekap.
2. Pastikan notifikasi diterima grup Telegram development.
3. Kirim ulang order dengan ID yang sama dan pastikan tidak ada transaksi atau notifikasi duplikat yang tidak diinginkan.
4. Matikan atau gunakan konfigurasi Telegram yang tidak valid; pastikan order tetap tersimpan dan kegagalan tercatat.
5. Pulihkan Telegram dan pastikan retry berhasil sesuai kebijakan.
6. Uji order dengan produk yang tidak ditemukan, jumlah tidak valid, dan channel yang tidak didukung; pastikan ditolak dengan error yang jelas.
7. Pastikan simulator tidak tersedia di konfigurasi production.
8. Pastikan data sensitif tidak muncul dalam pesan maupun log.

**Kriteria selesai**

- Skenario positif dan negatif lulus pada database test.
- Tidak ada ketergantungan pada akun toko sungguhan.

### Tahap 5 — Integrasikan sumber order sungguhan satu per satu

**Urutan yang disarankan**

1. Pilih satu sumber yang siap dan paling mudah diuji, misalnya website sendiri jika API/webhook tersedia.
2. Implementasikan penerimaan order (webhook atau polling) dan validasi autentikasi sumber.
3. Normalisasikan payload ke format transaksi internal.
4. Terapkan idempotensi untuk retry webhook/polling serta pencatatan error.
5. Uji pada mode sandbox atau akun/toko uji jika disediakan platform.
6. Setelah stabil, lanjutkan ke channel berikutnya: Shopee, Tokopedia, lalu TikTok Shop sesuai kesiapan akses API dan persetujuan platform.

**Kriteria selesai per channel**

- Order nyata masuk satu kali, terpetakan ke produk yang benar, dan tampil di rekap.
- Kegagalan sinkronisasi terlihat di log/antarmuka dan dapat dicoba ulang.
- Notifikasi Telegram tidak mengubah status order pada marketplace dan bukan pengganti konfirmasi resmi marketplace.

## Catatan keputusan sebelum implementasi

- Mekanisme simulator: endpoint development terlindungi atau CLI.
- Apakah order dummy mengurangi stok dan memicu sinkronisasi stok.
- Field ringkasan yang boleh dikirim ke Telegram.
- Apakah perlu tampilan status pengiriman Telegram di dashboard atau cukup log terlebih dahulu.
- Channel pertama untuk integrasi nyata dan ketersediaan sandbox/API-nya.

## Urutan MVP yang direkomendasikan

1. Database test dan grup Telegram development.
2. Simulator order development yang aman.
3. Queue, pengiriman Telegram, retry, dan pencatatan status.
4. Pengujian end-to-end dan duplikasi/kegagalan.
5. Integrasi satu channel nyata setelah toko siap.

Dengan urutan ini, alur order-ke-rekap dan notifikasi dapat diuji lebih awal menggunakan data dummy, tanpa berpura-pura bahwa integrasi marketplace sudah aktif.
