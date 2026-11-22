// Peta kurikulum: 5 modul, 40 pelajaran. 10 pelajaran pertama (urutan) gratis.
// 10 pelajaran gratis: 1.1 sampai 1.4, 2.1 sampai 2.6.
export const FREE_COUNT = 10;
export const XP = { lesson: 20, quiz: 10, mission: 30 };
export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 25;

const L = (id, idT, enT, idM, enM) => ({ id, title: { id: idT, en: enT }, mission: { id: idM, en: enM } });

export const MODULES = [
  { id: 1, icon: "👋", title: { id: "Kenalan sama Claude", en: "Meet Claude" }, level: { id: "Pemula (Lv 1-5)", en: "Beginner (Lv 1-5)" }, lessons: [
    L("1.1", "Kenalan, daftar, langsung ngobrol", "Meet, Sign Up, Start Chatting", "Buat akun lalu minta Claude memperkenalkan diri dengan pantun", "Create an account, then ask Claude to introduce itself as a rhyme"),
    L("1.2", "Resep Prompt: Siapa, Apa, Gimana", "The Prompt Recipe", "Ubah perintah \"buat resep\" jadi perintah lengkap", "Turn \"make a recipe\" into a complete request"),
    L("1.3", "Kirim foto dan pakai suara", "Send a Photo and Use Your Voice", "Foto isi kulkas, minta ide masakan atau tips lewat suara", "Snap your fridge for ideas, or ask for a tip by voice"),
    L("1.4", "Cek jawaban dan jaga data", "Check Answers and Protect Your Data", "Cek satu fakta ke sumber lain, lalu buat aturan aman keluarga", "Check one fact against another source, then make family safety rules"),
  ]},
  { id: 2, icon: "🏠", title: { id: "Claude Asisten Harian", en: "Claude for Everyday Life" }, level: { id: "Pemula (Lv 6-10)", en: "Beginner (Lv 6-10)" }, lessons: [
    L("2.1", "Menu masak seminggu", "Weekly Meal Planner", "Menu 7 hari + daftar belanja budget Rp300.000", "7-day menu + shopping list on a Rp300,000 budget"),
    L("2.2", "Atur keuangan keluarga", "Family Budget Helper", "Susun anggaran bulanan dari gaji", "Build a monthly budget from your salary"),
    L("2.3", "Kalkulator anggaran yang bisa diklik", "A Clickable Budget Calculator", "Buat kalkulator anggaran sendiri dengan angka keluargamu", "Build your own budget calculator with your family's numbers"),
    L("2.4", "Game tebak kata untuk anak", "A Word-Guessing Game for Kids", "Buat game tebak kata dan mainkan bersama anak", "Build a word-guessing game and play it with a child"),
    L("2.5", "Halaman toko dengan tombol WA", "A Shop Page with a WhatsApp Button", "Buat halaman usaha dengan tombol WA, lalu bagikan linknya", "Build a business page with a WhatsApp button, then share its link"),
    L("2.6", "Dari karya jadi cuan (cicipan)", "From Creations to Income (Preview)", "Tawarkan satu karyamu ke satu orang yang kamu kenal", "Offer one of your creations to one person you know"),
    L("2.7", "Jadwal & to-do list", "Plans & To-Do Lists", "Buat jadwal harian ibu bekerja", "Plan a working mom's daily schedule"),
    L("2.8", "Projects: Claude ingat kebutuhanmu", "Using Projects", "Buat Project \"Dapur Keluarga\"", "Create a \"Family Kitchen\" Project"),
  ]},
  { id: 3, icon: "🎬", title: { id: "Bikin Konten & Video", en: "Create Content & Videos" }, level: { id: "Menengah (Lv 11-15)", en: "Intermediate (Lv 11-15)" }, lessons: [
    L("3.1", "Cari ide konten tanpa pusing", "Finding Content Ideas", "30 ide konten untuk akun jualan kue", "30 content ideas for a cake shop account"),
    L("3.2", "Caption yang bikin orang berhenti scroll", "Scroll-Stopping Captions", "3 versi caption + hashtag", "3 caption versions + hashtags"),
    L("3.3", "Naskah video 30 detik", "30-Second Video Scripts", "Naskah hook, isi, ajakan untuk Reels", "Hook, body, call to action for Reels"),
    L("3.4", "Dari naskah jadi video", "From Script to Video", "Rekam di HP + edit di CapCut", "Record on your phone + edit in CapCut"),
    L("3.5", "Gambar & desain pakai Artifacts", "Visuals with Artifacts", "Buat poster promo atau kartu ucapan", "Make a promo poster or greeting card"),
    L("3.6", "Tulis artikel & blog", "Writing Articles", "Artikel 500 kata \"Tips Hemat Belanja\"", "A 500-word \"Smart Shopping Tips\" article"),
    L("3.7", "Kalender konten sebulan", "Monthly Content Calendar", "Jadwal posting 30 hari dalam tabel", "A 30-day posting plan in a table"),
    L("3.8", "Gaya bahasa khas kamu", "Finding Your Voice", "Ajari Claude gaya bicaramu dari 3 contoh", "Teach Claude your voice from 3 examples"),
  ]},
  { id: 4, icon: "📱", title: { id: "Bikin Aplikasi Tanpa Coding", en: "Build Apps Without Coding" }, level: { id: "Menengah (Lv 16-20)", en: "Intermediate (Lv 16-20)" }, lessons: [
    L("4.1", "Aplikasi itu sebenarnya apa?", "What Is an App, Really?", "Gambar ide aplikasi di kertas (3 layar)", "Sketch an app idea on paper (3 screens)"),
    L("4.2", "Artifacts: aplikasi jadi dalam chat", "Meet Artifacts", "Buat kalkulator ongkir sederhana", "Build a simple shipping cost calculator"),
    L("4.3", "Bikin kuis & game kecil", "Build a Quiz Game", "Game tebak kata untuk anak", "A word-guessing game for kids"),
    L("4.4", "Aplikasi catatan jualan", "A Simple Sales Tracker", "Catat pesanan dan total omzet", "Track orders and total sales"),
    L("4.5", "Kalau error, bilang aja ke Claude", "Fixing Errors Together", "Salin pesan error, minta Claude perbaiki", "Paste the error, ask Claude to fix it"),
    L("4.6", "Bikin landing page toko", "Build a Shop Landing Page", "Halaman profil usaha + tombol WhatsApp", "A business page + WhatsApp button"),
    L("4.7", "Bagikan aplikasimu", "Publish & Share", "Bagikan link aplikasi ke 3 teman", "Share your app link with 3 friends"),
    L("4.8", "Naik level: Claude Code & Android", "Next Step: Claude Code & Android", "Cek daftar kebutuhan Play Store", "Check the Play Store requirements list"),
  ]},
  { id: 5, icon: "💰", title: { id: "Cuan dari Claude", en: "Earn Money with Claude" }, level: { id: "Mahir (Lv 21-25)", en: "Advanced (Lv 21-25)" }, lessons: [
    L("5.1", "Peta 6 jalur cuan", "6 Ways to Earn", "Kuis \"jalur cuan yang cocok untukku\"", "Quiz: \"which path fits me\""),
    L("5.2", "Jasa tulis & admin sosmed", "Writing & Social Media Services", "Daftar harga jasa caption untuk UMKM", "A price list for caption services"),
    L("5.3", "Jual produk digital", "Selling Digital Products", "Buat e-book resep atau template planner", "Make a recipe e-book or planner template"),
    L("5.4", "Jadi kreator konten", "Earning as a Creator", "Rencana 30 hari menuju monetisasi", "A 30-day plan toward monetization"),
    L("5.5", "Jasa bikin web/aplikasi kecil", "Selling Simple Apps & Websites", "Tawarkan landing page ke 1 UMKM", "Offer a landing page to 1 local business"),
    L("5.6", "Bantu jualan online", "Boost Your Online Shop", "Deskripsi produk marketplace yang menjual", "Marketplace product descriptions that sell"),
    L("5.7", "Cari klien pertama", "Landing Your First Client", "Pesan penawaran + profil freelance", "An offer message + freelance profile"),
    L("5.8", "Jujur, aman & tahan lama", "Earning Honestly & Safely", "Kuis etika: hak cipta, klaim palsu, pajak", "Ethics quiz: copyright, false claims, tax"),
  ]},
];

export const ALL_LESSONS = MODULES.flatMap(m => m.lessons.map(l => ({ ...l, module: m.id })));
export const isFree = id => ALL_LESSONS.findIndex(l => l.id === id) < FREE_COUNT;

export const BADGES = [
  { id: "hello", icon: "👋", name: { id: "Halo Claude!", en: "Hello Claude!" }, how: { id: "Selesaikan pelajaran 1.1", en: "Finish lesson 1.1" }, test: p => !!p.done["1.1"] },
  { id: "chef", icon: "👩‍🍳", name: { id: "Juru Masak Digital", en: "Digital Chef" }, how: { id: "Kerjakan misi menu mingguan (2.1)", en: "Do the weekly menu mission (2.1)" }, test: p => !!p.done["2.1"]?.mission },
  { id: "director", icon: "🎬", name: { id: "Sutradara Cilik", en: "Little Director" }, how: { id: "Kerjakan misi video pertama (3.4)", en: "Do the first video mission (3.4)" }, test: p => !!p.done["3.4"]?.mission },
  { id: "appmaker", icon: "🌐", name: { id: "Tukang Halaman", en: "Page Builder" }, how: { id: "Bagikan halaman usaha pertama (2.5)", en: "Share your first business page (2.5)" }, test: p => !!p.done["2.5"]?.mission },
  { id: "cuan", icon: "💡", name: { id: "Calon Pengusaha", en: "Future Entrepreneur" }, how: { id: "Tawarkan karya ke satu orang (2.6)", en: "Offer a creation to one person (2.6)" }, test: p => !!p.done["2.6"]?.mission },
  { id: "streak7", icon: "🔥", name: { id: "Api 7 Hari", en: "7-Day Streak" }, how: { id: "Belajar 7 hari berturut-turut", en: "Learn 7 days in a row" }, test: p => (p.streak?.best || 0) >= 7 },
  { id: "streak30", icon: "🌋", name: { id: "Api 30 Hari", en: "30-Day Streak" }, how: { id: "Belajar 30 hari berturut-turut", en: "Learn 30 days in a row" }, test: p => (p.streak?.best || 0) >= 30 },
  { id: "graduate", icon: "🎓", name: { id: "Lulus Claudy", en: "Claudy Graduate" }, how: { id: "Selesaikan semua 40 pelajaran", en: "Finish all 40 lessons" }, test: p => ALL_LESSONS.every(l => p.done[l.id]) },
];

export const levelOf = xp => Math.min(MAX_LEVEL, Math.floor((xp || 0) / XP_PER_LEVEL) + 1);
