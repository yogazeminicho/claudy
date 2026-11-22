# Claudy Web App: Panduan Setup

## Stack yang dipakai, dan kenapa

| Bagian | Pakai apa | Kenapa |
|---|---|---|
| Tampilan web | HTML + CSS + JavaScript biasa (tanpa build, tanpa npm) | Bisa dibuka langsung, mudah dibungkus jadi aplikasi Android nanti (PWA / Capacitor) |
| Login | Firebase Authentication (Google + email) | Gratis, login Google satu klik cocok untuk pemula |
| Database (akun, progres, harga, voucher, pesanan) | Cloud Firestore | Google Drive tidak bisa jadi database. Firestore gratis sampai 50 ribu baca/hari |
| Hosting web | Firebase Hosting | Gratis, HTTPS otomatis, bisa pakai domain sendiri |
| Pembayaran | Midtrans Snap lewat Cloud Functions | QRIS, transfer VA bank, GoPay/OVO/DANA. Harga dan voucher dihitung di server supaya tidak bisa diakali |
| File (video, gambar master, backup kode) | Google Drive | Tetap jadi penyimpanan utama. Video pelajaran bisa diputar langsung dari Drive |

## Coba dulu tanpa setup apa pun (MODE DEMO)

Versi ini sudah berisi 10 pelajaran gratis dan 21 gambar pelajaran (sudah diperkecil ke WebP, total sekitar 1 MB) plus logo Kodi.

Selama `public/js/config.js` masih `firebaseConfig = null`, aplikasi jalan dalam mode demo:
data tersimpan di browser, pembayaran pura-pura, dan semua orang bisa membuka Panel Admin.

Cara buka di komputer (Windows):
1. Ekstrak `Claudy-WebApp.zip`, misalnya ke `D:\Claude\Claudy\WebApp`.
2. Buka PowerShell di folder itu, jalankan: `cd public` lalu `python -m http.server 8000`
3. Buka browser ke `http://localhost:8000`

(File `index.html` tidak bisa dibuka dengan klik dua kali, harus lewat perintah di atas.)

## Setup produksi (yang harus kamu lakukan sendiri)

### 1. Firebase (gratis)
1. Buka https://console.firebase.google.com, klik **Add project**, beri nama misalnya `claudy`.
2. **Build > Authentication > Get started**: aktifkan **Google** dan **Email/Password**.
3. **Build > Firestore Database > Create database**: pilih lokasi `asia-southeast2 (Jakarta)`, mode **production**.
4. **Project settings (ikon gerigi) > Your apps > ikon `</>`**: daftarkan web app, salin isi `firebaseConfig`, tempel ke `public/js/config.js`.

### 2. Upload ke internet
1. Pasang Node.js LTS (versi 22) dari https://nodejs.org.
2. Di PowerShell: `npm install -g firebase-tools`, lalu `firebase login`.
3. Di folder WebApp: `firebase use --add` (pilih project tadi), lalu `firebase deploy --only hosting,firestore`.
4. Web langsung online di `https://<nama-project>.web.app`.

### 3. Jadikan dirimu admin
1. Buka web, login sekali dengan akun Google kamu.
2. Di Firebase Console > **Authentication > Users**, salin **User UID** kamu.
3. Di **Firestore > Start collection**: nama koleksi `admins`, Document ID = UID tadi, isi satu field bebas (misal `nama: Yoga`).
4. Muat ulang web. Menu **Admin** muncul.

### 4. Pembayaran Midtrans (perlu keputusan kamu, ada biaya)
- **Firebase Blaze plan**: Cloud Functions hanya jalan di paket Blaze (perlu kartu/billing). Pemakaian kecil biasanya Rp0, tapi tetap pasang budget alert $5.
- **Akun Midtrans**: daftar di https://dashboard.midtrans.com. Mulai di mode **Sandbox** (gratis, uang pura-pura). Untuk uang sungguhan perlu verifikasi usaha (KTP/NPWP, rekening). Biaya per transaksi kira-kira QRIS 0,7% dan VA bank sekitar Rp4.000 (cek harga terbaru di Midtrans).
- Setelah dua akun itu siap:
  1. `cd functions` lalu `npm install`
  2. `firebase functions:secrets:set MIDTRANS_SERVER_KEY` (tempel Server Key dari Midtrans > Settings > Access Keys)
  3. `firebase deploy --only functions`
  4. Salin URL `midtransWebhook` yang muncul, tempel di Midtrans > Settings > Payment > **Notification URL**.
  5. Saat siap terima uang sungguhan: buat file `functions/.env` berisi `MIDTRANS_PRODUCTION=true`, ganti Server Key ke kunci Production, deploy ulang.

**Belum mau pakai Midtrans?** Bisa terima transfer manual dulu: user transfer, konfirmasi lewat WhatsApp, lalu kamu buka aksesnya di **Admin > Pengguna** (+30 hari / Lifetime).

## Panel Admin

- **Harga**: ubah harga Bulanan dan Lifetime, dan voucher sambutan yang ditawarkan setelah 10 pelajaran gratis selesai.
- **Voucher**: kode, jenis (persen atau potongan Rupiah), nilai, batas pemakaian, tanggal kedaluwarsa, berlaku untuk paket apa, aktif/nonaktif.
- **Pengguna**: lihat progres user, buka/cabut akses Premium manual.
- **Pesanan**: daftar pembayaran dan total yang lunas.
- **Konten berbayar**: unggah materi pelajaran 2.3 dan seterusnya.

## Menambah atau memperbarui materi pelajaran

Materi dibaca dari folder `Claudy/Konten` (yang ada di Google Drive kamu).
1. Tulis pelajaran baru dengan format sama (`Modul-2/2.3-.../naskah-ID.md` dan `script-EN.md`).
2. Gambar pelajaran: taruh di subfolder `gambar/` di folder pelajaran itu.
3. Video: unggah ke Google Drive, set **Siapa saja yang memiliki link bisa melihat**, lalu tulis ID file-nya (bagian link di antara `/d/` dan `/view`) ke file `video-drive-id.txt` di folder pelajaran.
4. Logo Kodi diambil otomatis dari `Konten/00-Kodi-Maskot/kodi-senang.png` (latar hitam dibuat transparan). Mau logo lain? Simpan sebagai `kodi-logo.png` di folder yang sama.
   Urutan gambar di pelajaran: file berawalan/berisi `sampul` tampil paling atas, `perayaan` paling bawah, sisanya di bawah materi.
5. Sekali saja: `pip install pillow` (supaya gambar otomatis diperkecil). Lalu jalankan `python tools/build_content.py "D:\Claude\Claudy\Konten"`.
   - Pelajaran gratis masuk ke `public/content/lessons.json` (ikut di-deploy).
   - Pelajaran berbayar masuk ke `paid-lessons.json` (TIDAK ikut di-deploy). Unggah lewat **Admin > Konten berbayar**.
6. `firebase deploy --only hosting`.

Catatan: video di Google Drive yang dibagikan "siapa saja dengan link" bisa ditonton siapa pun yang tahu link-nya. Untuk video pelajaran berbayar, nanti lebih aman pindah ke penyimpanan yang terkunci (misalnya Firebase Storage).

## Batasan versi MVP ini

- Langganan Bulanan = bayar per 30 hari (tidak ditagih otomatis tiap bulan). Penagihan otomatis butuh fitur langganan Midtrans/kartu kredit, bisa ditambah nanti.
- Misi praktik dicentang sendiri oleh user (belum ada unggah screenshot).
- Belum ada: sertifikat PDF, "Es Teh Penyelamat" streak, aplikasi Android (Langkah 4).
- Kuota voucher dihitung saat pembayaran lunas, jadi kalau banyak orang bayar bersamaan, kuota bisa terlewati sedikit.
