const S = {
  id: {
    tagline: "Belajar Claude AI dari nol sampai cuan. Gampang, seru, pakai bahasa sehari-hari.",
    start: "Mulai belajar gratis", login: "Masuk", logout: "Keluar", learn: "Belajar", badges: "Lencana", plans: "Langganan", admin: "Admin",
    hero_points: ["10 pelajaran pertama gratis", "Tiap pelajaran 3 sampai 7 menit", "Ditemani Kodi, si robot kucing", "Bahasa Indonesia & Inggris"],
    modules: "Modul belajar", lessons: "pelajaran", free: "Gratis", locked: "Terkunci", premium: "Premium",
    level: "Level", streak: "hari beruntun", next_level: "XP lagi ke level berikutnya",
    login_title: "Masuk ke Claudy", google: "Masuk dengan Google", or: "atau pakai email", name: "Nama panggilan", email: "Email", password: "Kata sandi (min. 6 huruf)",
    sign_in: "Masuk", sign_up: "Daftar baru", have_account: "Sudah punya akun? Masuk", no_account: "Belum punya akun? Daftar",
    read_aloud: "🔊 Bacakan", stop_read: "⏹️ Berhenti", big_text: "Teks besar",
    mission: "Misi praktik", mission_done: "Saya sudah kerjakan misinya", quiz: "Kuis", check: "Cek jawaban", finish: "Selesai, dapat XP!",
    right: "Benar! 🎉", wrong: "Belum tepat. Jawaban yang benar sudah ditandai hijau.", perfect: "Sempurna! +10 XP", done_already: "Pelajaran ini sudah selesai ✅",
    next: "Pelajaran berikutnya", back: "Kembali ke daftar", coming: "Materi pelajaran ini sedang disiapkan. Cek lagi nanti ya!",
    gate_title: "Pelajaran ini untuk anggota Premium", gate_text: "Kamu sudah menyelesaikan bagian gratis. Lanjutkan perjalananmu bersama Kodi sampai bisa menghasilkan uang dari Claude.",
    see_plans: "Lihat paket langganan", need_login: "Masuk dulu ya, supaya progresmu tersimpan.",
    monthly: "Bulanan", lifetime: "Selamanya (Lifetime)", per_month: "/ 30 hari", once: "sekali bayar",
    monthly_desc: "Semua 40 pelajaran, semua lencana, sertifikat. Bayar per 30 hari, berhenti kapan saja.",
    lifetime_desc: "Semua isi selamanya, modul baru gratis, bonus template Cuan.",
    voucher: "Kode voucher", apply: "Pakai", pay: "Bayar sekarang", your_plan: "Paket kamu", active_until: "aktif sampai", forever: "aktif selamanya",
    v_ok: "Voucher dipakai!", v_notfound: "Kode voucher tidak ditemukan.", v_inactive: "Voucher sudah tidak aktif.", v_expired: "Voucher sudah kedaluwarsa.", v_usedup: "Kuota voucher sudah habis.", v_plan: "Voucher ini tidak berlaku untuk paket ini.",
    paid_ok: "Pembayaran berhasil! Semua pelajaran sudah terbuka. 🎉", pay_wait: "Terima kasih! Pembayaranmu sedang dicek. Akses terbuka otomatis setelah lunas.",
    demo_banner: "MODE DEMO: data tersimpan di browser ini saja dan pembayaran hanya pura-pura.",
    welcome_offer: "Hadiah untukmu: pakai kode", earned: "Lencana baru!", xp_gain: "XP didapat",
    no_disclaimer: "Claudy tidak menjanjikan angka penghasilan. Hasil tiap orang berbeda.",
  },
  en: {
    tagline: "Learn Claude AI from zero to earning. Easy, fun, in everyday words.",
    start: "Start learning free", login: "Sign in", logout: "Sign out", learn: "Learn", badges: "Badges", plans: "Plans", admin: "Admin",
    hero_points: ["First 10 lessons free", "3 to 7 minutes per lesson", "With Kodi, the robot cat", "Indonesian & English"],
    modules: "Modules", lessons: "lessons", free: "Free", locked: "Locked", premium: "Premium",
    level: "Level", streak: "day streak", next_level: "XP to the next level",
    login_title: "Sign in to Claudy", google: "Continue with Google", or: "or use email", name: "Nickname", email: "Email", password: "Password (min. 6 characters)",
    sign_in: "Sign in", sign_up: "Create account", have_account: "Have an account? Sign in", no_account: "New here? Create an account",
    read_aloud: "🔊 Read aloud", stop_read: "⏹️ Stop", big_text: "Big text",
    mission: "Practice mission", mission_done: "I did the mission", quiz: "Quiz", check: "Check answers", finish: "Done, get XP!",
    right: "Correct! 🎉", wrong: "Not quite. The right answer is marked green.", perfect: "Perfect! +10 XP", done_already: "You finished this lesson ✅",
    next: "Next lesson", back: "Back to lessons", coming: "This lesson is being prepared. Check back soon!",
    gate_title: "This lesson is for Premium members", gate_text: "You've finished the free part. Keep going with Kodi until you can earn money with Claude.",
    see_plans: "See plans", need_login: "Please sign in so your progress is saved.",
    monthly: "Monthly", lifetime: "Lifetime", per_month: "/ 30 days", once: "one-time",
    monthly_desc: "All 40 lessons, all badges, certificates. Pay every 30 days, stop anytime.",
    lifetime_desc: "Everything forever, new modules free, bonus earning templates.",
    voucher: "Voucher code", apply: "Apply", pay: "Pay now", your_plan: "Your plan", active_until: "active until", forever: "active forever",
    v_ok: "Voucher applied!", v_notfound: "Voucher code not found.", v_inactive: "This voucher is no longer active.", v_expired: "This voucher has expired.", v_usedup: "This voucher has been fully used.", v_plan: "This voucher doesn't apply to this plan.",
    paid_ok: "Payment successful! All lessons are unlocked. 🎉", pay_wait: "Thank you! Your payment is being checked. Access opens automatically once it's paid.",
    demo_banner: "DEMO MODE: data is stored in this browser only and payments are simulated.",
    welcome_offer: "A gift for you: use code", earned: "New badge!", xp_gain: "XP earned",
    no_disclaimer: "Claudy does not promise any income figures. Results vary for everyone.",
  },
};
let lang = (() => { try { return localStorage.getItem("claudy-lang") || "id"; } catch { return "id"; } })();
if (!S[lang]) lang = "id";
export const getLang = () => lang;
export const setLang = l => { lang = l; try { localStorage.setItem("claudy-lang", l); } catch {} document.documentElement.lang = l; };
export const t = k => S[lang][k] ?? S.id[k] ?? k;
export const tr = o => (o && typeof o === "object") ? (o[lang] ?? o.id) : o;
document.documentElement.lang = lang;
