# Roadmap Pembaruan Rekap Omnichannel

## Tujuan

Mengembangkan Rekap Omnichannel dari aplikasi rekap penjualan dan stok menjadi alat operasional yang dapat dipercaya untuk toko online: data transaksi akurat, stok terkendali lintas channel, margin dapat dihitung, dan pekerjaan rutin dapat diotomasi.

Roadmap ini mengurutkan pekerjaan berdasarkan ketergantungan data dan risiko. Fitur analitik, AI, dan skala bisnis tidak sebaiknya dibangun di atas data order, stok, atau biaya yang belum tervalidasi.

## Kondisi awal yang perlu diperhatikan

- Dashboard, rekap transaksi, produk dan stok, sinkronisasi, akuntansi, analisis produk, asisten AI, audit log, dan role dasar sudah memiliki sebagian implementasi.
- Konektor pengambilan order Tokopedia, Shopee, dan TikTok Shop masih perlu dibuktikan terhadap API nyata; beberapa service channel masih berupa stub.
- Produk induk dan pemetaan produk-channel sudah menjadi fondasi yang ada, tetapi perlu divalidasi untuk kasus SKU, listing, toko, dan varian yang sesungguhnya.
- n8n tersedia sebagai service development lokal di Compose. Belum ada workflow n8n yang terhubung ke event atau API aplikasi.
- Data contoh/seed membantu eksplorasi UI tetapi bukan bukti integrasi marketplace bekerja. Seed dapat menghapus data pada tabel tertentu; jangan gunakan terhadap database operasional.
- Periksa angka dashboard yang dilaporkan, termasuk omzet `Rp 0` ketika transaksi tercatat, sebelum menambah laporan atau integrasi baru.

## Prinsip lintas tahap

1. **Satu sumber kebenaran.** Database dan domain service aplikasi menjadi sumber data transaksi, stok, dan akuntansi. n8n mengorkestrasi pekerjaan, bukan menggantikan aturan bisnis inti.
2. **Ledger dan idempotensi.** Perubahan transaksi, stok, payout, dan jurnal harus dapat ditelusuri serta aman terhadap webhook, retry, dan job duplikat.
3. **Uji terpisah dari operasional.** Gunakan database, akun channel, dan grup notifikasi development. Hindari pengujian yang berpotensi mengubah stok atau mengirim pesan nyata.
4. **Rahasiakan kredensial.** Token marketplace, bot, API key, dan encryption key hanya berada pada environment/secret backend atau n8n; tidak di source control, browser, atau log.
5. **Kontrak channel dinormalisasi.** Petakan status eksternal, produk, biaya, waktu, dan identitas toko ke format internal dengan menyimpan referensi sumber untuk audit.
6. **Persetujuan untuk tindakan berisiko.** Perubahan harga, stok besar, jurnal final, pengiriman pesan ke pelanggan, dan aksi AI memerlukan batasan serta persetujuan manusia yang sesuai.
7. **Bangun vertikal per kebutuhan.** Mulai dari satu kasus nyata dan satu channel yang siap, uji sampai selesai, lalu perluas.

## Tahap 1 — Fondasi data dan sinkronisasi

**Tujuan:** memastikan angka dashboard, transaksi, pemetaan produk, dan status sinkronisasi dapat dipercaya sebelum fitur berikutnya dibangun.

### Pekerjaan

- [ ] Telusuri mengapa omzet dapat menunjukkan `Rp 0` ketika jumlah transaksi bukan nol. Periksa rentang tanggal/timezone, status transaksi yang masuk hitungan, agregasi SQL, serialisasi nilai numerik, dan filter dashboard.
- [ ] Tetapkan definisi metrik secara eksplisit: omzet bruto/neto, status mana yang dihitung, perlakuan ongkir/refund/pembatalan, rentang waktu, dan mata uang.
- [ ] Tambahkan regression test untuk agregasi backend dan kontrak data dashboard; sertakan data lintas channel, status, tanggal, ongkir, dan nominal numeric.
- [ ] Audit alur `channel + shop/account + external order ID` dan idempotensi; pastikan satu order yang dikirim ulang tidak menggandakan transaksi atau pergerakan stok.
- [ ] Validasi master produk dan `product_channel_mapping`: SKU induk, ID listing eksternal, toko pemilik listing, status listing, dan kebijakan jika mapping hilang/duplikat.
- [ ] Lengkapi sync log dengan error yang dapat ditindaklanjuti (auth/token, rate limit, validasi/mapping, timeout, API berubah), retry/backoff, dan isolasi kegagalan per toko/channel.
- [ ] Verifikasi konektor masing-masing channel terhadap sandbox atau akses/API resmi yang tersedia. Tandai dengan jelas channel yang masih stub atau belum dikonfigurasi.
- [ ] Sediakan simulator atau fixture order development untuk uji normalisasi, duplikasi, mapping, perubahan stok, dan kegagalan tanpa toko sungguhan.

### Kriteria selesai

- Metrik omzet memiliki definisi yang disepakati, konsisten dengan transaksi uji dan tampil benar di dashboard, tabel, ekspor, serta laporan terkait.
- Setiap order uji tersimpan paling banyak satu kali; perubahan stok hanya diterapkan sekali.
- Kegagalan satu konektor tidak menghentikan sync channel/toko lain dan alasan kegagalan dapat diketahui operator.
- Toko, produk, dan data uji tidak tercampur dengan data production.

## Tahap 2 — Nilai utama: stok dan profitabilitas

**Tujuan:** menjaga ketersediaan barang lintas channel dan memberi gambaran margin yang realistis.

### 2A. Persediaan lintas channel

- [ ] Tetapkan stok tersedia, stok fisik, stok dipesan/direservasi, buffer, dan aturan kapan order mengurangi stok.
- [ ] Simpan setiap perubahan sebagai stock movement yang dapat diaudit; hindari mengubah saldo tanpa sebab/sumber.
- [ ] Dorong stok ke semua listing aktif dari produk induk setelah pergerakan stok terkonfirmasi; jadwalkan/antrekan push dengan retry dan rate limit per channel.
- [ ] Tambahkan buffer stock per produk dan/atau listing untuk mengurangi risiko oversell. Definisikan alokasi stok, pembulatan, dan perilaku jika API channel gagal.
- [ ] Tambahkan peringatan untuk mapping yang tidak lengkap, push stok gagal, dan selisih antara stok lokal dan channel.

### 2B. HPP, biaya, dan laba

- [ ] Tetapkan model biaya order: harga barang, diskon/voucher, biaya layanan/komisi, biaya iklan, ongkir yang ditanggung pihak terkait, refund, dan biaya lain.
- [ ] Pilih metode HPP awal (misalnya rata-rata tertimbang) dan aturan pencatatan penerimaan/retur. Jangan mengklaim laba bersih sebelum biaya yang relevan tersedia.
- [ ] Buat model rekonsiliasi payout marketplace yang menghubungkan settlement, potongan, refund, dan transaksi berdasarkan referensi eksternal.
- [ ] Tampilkan laba kotor/neto per produk, channel, dan periode dengan jejak asal setiap komponen.
- [ ] Buat proses rekonsiliasi untuk item unmatched, selisih nominal, transaksi duplikat, dan payout parsial; jangan menutup selisih secara diam-diam.

### Kriteria selesai

- Order dari channel uji mengubah ledger stok satu kali dan stok listing lain diperbarui sesuai kebijakan buffer.
- Gangguan API ditampilkan sebagai status tertunda/gagal dan dapat dicoba ulang tanpa menggandakan perubahan.
- Laporan margin menjelaskan komponen HPP dan biaya serta direkonsiliasi terhadap sampel settlement nyata/sandbox.

### Keputusan sebelum implementasi

- Sumber stok utama dan dukungan multi-gudang.
- Metode serta waktu pengakuan HPP.
- Perlakuan biaya marketplace, voucher, ads, retur, dan ongkir pada margin.
- Channel pertama untuk pilot, berdasarkan akses API, sandbox, dan kesiapan toko.

## Tahap 3 — Efisiensi operasional dan otomasi

**Tujuan:** mengurangi pekerjaan berulang setelah alur transaksi dan stok stabil.

### Pekerjaan

- [ ] Buat inbox pesanan dengan status internal seragam dan pemetaan status channel yang tetap dapat ditelusuri.
- [ ] Tambahkan input pesanan manual untuk order offline/WhatsApp dengan validasi dan sumber order yang jelas.
- [ ] Implementasikan penanganan cancel/retur/refund yang mengoreksi stok dan perhitungan laporan melalui ledger.
- [ ] Implementasikan export/import dan bulk edit produk/harga dengan preview, validasi, serta hasil per baris.
- [ ] Tambahkan cetak label pengiriman dan packing list massal setelah data alamat, kurir, paket, dan status order tersedia.
- [ ] Bangun notifikasi melalui outbox/queue aplikasi. Gunakan n8n sebagai orkestrator dan adapter notifikasi, bukan tempat menyimpan satu-satunya catatan status bisnis.
- [ ] Mulai dari event non-sensitif seperti stok rendah atau sync gagal, lalu notifikasi order baru ke grup internal Telegram development.
- [ ] Tambahkan retry, idempotensi, pencatatan status delivery, secret webhook, dan kebijakan payload minim-data. Simpan credential pada n8n/backend.
- [ ] Perluas role: admin, gudang, CS, dan keuangan; terapkan pemeriksaan hak akses di backend, bukan hanya menyembunyikan UI.
- [ ] Tambahkan laporan terjadwal dan ekspor PDF/Excel bila definisi angka serta izin penerima sudah disepakati.

### Kriteria selesai

- Operasi manual dan otomatis memakai aturan domain yang sama, mencatat aktor/sumber, dan dapat diaudit.
- Kegagalan notifikasi tidak membatalkan order atau pergerakan stok.
- Role tidak dapat mengakses operasi/field di luar kewenangannya melalui API langsung.

## Tahap 4 — Analitik lanjutan dan AI berbasis data

**Tujuan:** menghasilkan saran yang dapat dijelaskan dari data yang sudah cukup lengkap.

### Pekerjaan

- [ ] Buat metrik margin bersih dengan cakupan biaya dan keterbatasan yang terlihat.
- [ ] Implementasikan ABC, fast/slow moving, dan produk bermargin negatif dengan definisi periode dan ambang yang dapat dikonfigurasi secara terkendali.
- [ ] Tambahkan rekomendasi restock berbasis lead time, tren, musim, dan buffer; tampilkan asumsi serta rentang keyakinan.
- [ ] Tambahkan perbandingan harga channel dan saran harga dengan batas margin minimum dan aturan persetujuan.
- [ ] Buat tanya-jawab data memakai API/layanan query terkontrol dan read-only; jangan memberi AI akses SQL bebas ke database.
- [ ] Buat ringkasan harian/mingguan dan deteksi anomali dengan ambang, sumber, dan tautan ke data pendukung.
- [ ] Tambahkan generator deskripsi listing per channel serta draft balasan CS; review manusia wajib sebelum publikasi/pengiriman.
- [ ] Untuk aksi AI, pisahkan proposal dari eksekusi: tampilkan dampak, otorisasi, approval, idempotensi, dan audit trail.
- [ ] Tentukan kebijakan privasi, retensi, provider/model, biaya, redaksi data sensitif, dan perilaku saat AI tidak tersedia.

### Kriteria selesai

- Jawaban dan rekomendasi menyertakan periode, sumber, asumsi, dan batasan data.
- AI tidak dapat menulis ke sistem bisnis atau mengirim komunikasi eksternal tanpa persetujuan dan otorisasi.
- Hasil AI diuji pada skenario salah data, data kurang, provider gagal, dan prompt yang tidak tepercaya.

## Tahap 5 — Skala produk dan ekosistem

**Tujuan:** menyiapkan aplikasi untuk banyak toko/organisasi dan pengguna eksternal setelah kebutuhan operasional inti terbukti.

### Pekerjaan

- [ ] Rancang tenant/org boundary dan migrasi data sebelum mengaktifkan multi-tenant.
- [ ] Terapkan isolasi tenant pada skema, query, queue, file, audit, dan kredensial channel; uji kebocoran lintas tenant.
- [ ] Tambahkan paket/billing, kuota channel/job, onboarding, suspend/cancel, dan pemulihan akun bila model bisnis sudah jelas.
- [ ] Rancang API publik, OAuth/API key, scope, rate limit, idempotensi, versioning, webhook signing, dan dokumentasi.
- [ ] Buat PWA/mobile untuk alur gudang yang memerlukan kamera/barcode dan dukungan konektivitas terbatas.
- [ ] Tambahkan dashboard yang dapat dikustomisasi setelah metrik utama stabil.
- [ ] Siapkan backup/restore, observability, incident response, privasi, serta dukungan pelanggan untuk operasi multi-tenant.

### Kriteria selesai

- Ada automated tests yang membuktikan data, file, job, dan API setiap tenant terisolasi.
- Pemulihan backup dan migrasi diuji sebelum pelanggan eksternal menggunakan sistem.
- Billing, kuota, autentikasi API, dan batas layanan diuji terhadap abuse dan kegagalan pembayaran.

## Urutan MVP yang direkomendasikan

1. **Fondasi:** diagnosis omzet `Rp 0`, uji dashboard/ekspor, audit idempotensi dan ledger stok, validasi SKU mapping.
2. **Pilot satu channel:** pilih channel yang memiliki akses API/sandbox paling siap; sinkronkan order baru hingga muncul benar di rekap.
3. **Nilai stok:** sinkronisasi stok dengan buffer, retry, dan observabilitas; uji oversell dan gangguan channel.
4. **Nilai finansial:** HPP yang disepakati, import/rekonsiliasi payout, dan margin dengan komponen biaya yang transparan.
5. **Efisiensi:** inbox, input manual, retur/cancel, operasi bulk, role, dan notifikasi n8n.
6. **Pembeda:** analitik/restock dan AI read-only/approval setelah kualitas data memenuhi ambang.
7. **Skala:** multi-tenant, billing, API publik, dan mobile setelah model operasi serta dukungan pelanggan tervalidasi.

## Di luar cakupan tahap awal

- Menghubungkan semua marketplace sekaligus sebelum satu konektor berhasil diuji end-to-end.
- Menghitung “laba bersih” dari data yang belum mencakup HPP dan potongan marketplace.
- Membiarkan n8n atau AI menjadi sumber kebenaran transaksi/stok.
- Mengirim WhatsApp/Telegram kepada pelanggan dari order produksi tanpa dasar opt-in, aturan channel, dan persetujuan yang sesuai.
- Mengaktifkan multi-tenant atau billing sebelum isolasi data dan pemulihan diuji.

## Cara memakai roadmap

- Pilih satu tahap dan satu hasil yang terukur untuk setiap iterasi; jangan mengimplementasikan seluruh daftar sekaligus.
- Sebelum memulai fitur, tulis kontrak data, perubahan database/migrasi, izin role, skenario retry/duplikasi, dan kriteria penerimaan.
- Tandai setiap butir sebagai `Belum dimulai`, `Berjalan`, atau `Selesai` pada issue/PR terkait. Roadmap ini adalah urutan dan ruang lingkup, bukan klaim bahwa fitur yang direncanakan sudah tersedia.
- Prioritaskan temuan yang merusak keakuratan omzet, transaksi, atau stok di atas fitur baru.
