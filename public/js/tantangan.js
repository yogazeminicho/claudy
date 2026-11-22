// Tantangan 2 menit setiap hari. Dipilih berdasarkan tanggal (siklus 30 hari).
export const TANTANGAN = [
  { title: "Ucapan ulang tahun untuk ibu", prompt: "Buatkan ucapan ulang tahun yang hangat untuk ibuku, 3 kalimat, bahasa sederhana." },
  { title: "Ide bekal anak", prompt: "Kasih 5 ide bekal sekolah untuk anak SD yang tidak suka sayur, mudah dibuat dalam 15 menit." },
  { title: "Pesan minta maaf ke tetangga", prompt: "Tulis pesan WhatsApp singkat dan sopan untuk minta maaf ke tetangga karena berisik tadi malam." },
  { title: "Daftar belanja hari ini", prompt: "Buatkan daftar belanja pasar untuk masak 3 hari dengan bahan: telur, tempe, bayam, dan wortel. Kelompokkan per jenis." },
  { title: "Caption untuk foto masakan", prompt: "Buatkan 3 caption pendek dan lucu untuk foto nasi goreng buatanku, dengan emoji." },
  { title: "Tips hemat listrik", prompt: "Kasih 5 tips hemat listrik di rumah yang tidak butuh biaya, dalam daftar bernomor." },
  { title: "Surat izin anak sakit", prompt: "Tulis surat izin tidak masuk sekolah untuk anak kelas 2 SD yang demam, maksimal 4 kalimat, sopan." },
  { title: "Resep kue tanpa oven", prompt: "Berikan resep kue sederhana tanpa oven untuk 4 orang, dengan langkah bernomor dan bahan mudah dicari." },
  { title: "Nama usaha kecil", prompt: "Kasih 10 ide nama untuk usaha jualan kue rumahan, singkat dan mudah diingat." },
  { title: "Pantun untuk grup arisan", prompt: "Buatkan pantun lucu 4 baris untuk membuka acara arisan keluarga." },
  { title: "Rencana akhir pekan", prompt: "Buatkan rencana akhir pekan murah untuk keluarga 4 orang, budget Rp200.000, dalam tabel." },
  { title: "Jawaban untuk pelanggan", prompt: "Tulis balasan sopan untuk pelanggan yang bertanya, 'Kenapa pesanan saya belum datang?' Ramah dan jelas." },
  { title: "Ringkas berita pagi", prompt: "Ringkas 3 kalimat tentang manfaat jalan kaki setiap pagi, untuk dibaca di grup keluarga." },
  { title: "Cerita sebelum tidur", prompt: "Buatkan cerita pendek 5 kalimat tentang kucing yang suka membantu ibu di dapur, untuk anak 5 tahun." },
  { title: "Pengingat minum obat", prompt: "Buatkan 3 kalimat pengingat untuk orang tua minum obat tepat waktu, dengan nada lembut. Ingatkan untuk bertanya dokter bila ragu." },
  { title: "Menu sarapan praktis", prompt: "Kasih 5 ide sarapan yang bisa disiapkan dalam 10 menit untuk keluarga yang sibuk." },
  { title: "Judul postingan jualan", prompt: "Buatkan 5 judul menarik untuk postingan jualan sambal rumahan di media sosial." },
  { title: "Kata-kata semangat", prompt: "Tulis 3 kalimat semangat untuk temanku yang sedang belajar hal baru, bahasa santai." },
  { title: "Pertanyaan untuk dokter", prompt: "Bantu aku menyusun 3 pertanyaan yang perlu ditanyakan ke dokter tentang tekanan darah tinggi." },
  { title: "Undangan syukuran", prompt: "Buatkan teks undangan syukuran sederhana untuk 30 tamu, hari Sabtu pukul 18.00." },
  { title: "Tebak kata lucu", prompt: "Buatkan 3 teka-teki tebak kata lucu tentang buah, untuk anak usia 7 tahun, lengkap dengan jawabannya." },
  { title: "Rapikan catatan belanja", prompt: "Rapikan daftar ini jadi tabel: beras 5kg Rp75.000, minyak 1L Rp18.000, gula 1kg Rp16.000. Tambahkan total." },
  { title: "Kenalan dengan tetangga baru", prompt: "Tulis pesan sapaan ramah untuk tetangga baru, 3 kalimat, mengajak ngobrol di depan rumah." },
  { title: "Tips tidur anak", prompt: "Kasih 5 kebiasaan sebelum tidur yang membantu anak SD tidur lebih cepat, dalam bahasa sederhana." },
  { title: "Deskripsi produk singkat", prompt: "Tulis deskripsi produk 2 kalimat untuk tas rajut buatan tangan, menarik tapi jujur." },
  { title: "Menu makan malam sederhana", prompt: "Kasih menu makan malam 3 hari dengan tempe, tahu, dan telur. Tidak pedas, mudah dibuat." },
  { title: "Pesan untuk grup RT", prompt: "Tulis pengumuman singkat di grup RT tentang kerja bakti Minggu pagi pukul 07.00." },
  { title: "Mengatur waktu di rumah", prompt: "Buatkan jadwal harian 3 blok waktu untuk ibu yang juga jualan online: pagi, siang, malam." },
  { title: "Ide hadiah sederhana", prompt: "Kasih 5 ide hadiah ulang tahun untuk anak 8 tahun dengan budget di bawah Rp100.000." },
  { title: "Tanya Claude tentang harga", prompt: "Tanyakan ke Claude: 'Berapa harga cabai hari ini?' Lalu catat apa jawabannya, dan cek ke pasar atau sumber lain." },
  { title: "Kata penutup dari hari ini", prompt: "Buatkan kalimat penutup 2 baris untuk catatan harianku, positif dan santai." },
];

export const tantanganHariIni = (d = new Date()) => {
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d - start) / 864e5);
  return TANTANGAN[day % TANTANGAN.length];
};
