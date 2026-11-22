import { MODULES, ALL_LESSONS, BADGES, XP, XP_PER_LEVEL, MAX_LEVEL, FREE_COUNT, isFree, levelOf } from "./curriculum.js";
import { voucherProblem, finalPrice, rupiah } from "./pricing.js";
import { t, tr, getLang, setLang } from "./i18n.js";
import { firebaseConfig } from "./config.js";

const B = firebaseConfig ? await import("./backend-firebase.js") : await import("./backend-local.js");
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const view = $("#view");

const state = { user: null, profile: null, admin: false, pricing: null, content: null, ready: false };
const isPremium = p => !!p && (p.plan === "lifetime" || (p.premiumUntil && p.premiumUntil > Date.now()));
const kodi = (cls = "") => `<img class="kodi ${cls}" src="img/kodi.png" onerror="this.onerror=null;this.src='img/kodi.svg'" alt="Kodi">`;
// Gambar pelajaran: alt diambil dari nama file (mis. "sampul-kodi-detektif.webp" -> "sampul kodi detektif").
const lessonImg = (src, i) => `<img class="lesson-img" src="${esc(src)}" alt="${esc(src.split("/").pop().replace(/\.[a-z]+$/i, "").replace(/-/g, " "))}" ${i ? 'loading="lazy"' : ""}>`;
const fmtDate = ms => new Date(ms).toLocaleDateString(getLang() === "en" ? "en-GB" : "id-ID", { day: "numeric", month: "short", year: "numeric" });

function toast(msg) {
  const el = document.createElement("div"); el.className = "toast"; el.innerHTML = msg;
  document.body.appendChild(el); setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 400); }, 3200);
}
const errMsg = e => {
  const m = String(String(e?.message).startsWith("voucher/") ? e.message : (e?.code || e?.message || e));
  const map = { "auth/invalid-credential": "Email atau kata sandi salah. / Wrong email or password.", "auth/email-already-in-use": "Email sudah terdaftar. / Email already registered.", "auth/weak-password": "Kata sandi minimal 6 huruf. / Password needs 6+ characters.", "auth/popup-closed-by-user": "Jendela login ditutup. / Sign-in window closed." };
  for (const k in map) if (m.includes(k)) return map[k];
  if (m.startsWith("voucher/")) return t("v_" + m.split("/")[1]);
  return m;
};

// ---------- progres & XP ----------
function todayStr(d = new Date()) { return d.toISOString().slice(0, 10); }
async function award(patchDone, gained) {
  const p = state.profile, uid = state.user.uid;
  const before = levelOf(p.xp);
  p.xp = (p.xp || 0) + gained;
  const today = todayStr(), yest = todayStr(new Date(Date.now() - 864e5));
  const s = p.streak || { count: 0, best: 0, last: null };
  if (s.last !== today) { s.count = s.last === yest ? s.count + 1 : 1; s.last = today; s.best = Math.max(s.best || 0, s.count); }
  p.streak = s;
  Object.assign(p.done, patchDone);
  const newBadges = BADGES.filter(b => !p.badges.includes(b.id) && b.test(p));
  p.badges = [...p.badges, ...newBadges.map(b => b.id)];
  await B.saveProfile(uid, { xp: p.xp, done: p.done, streak: p.streak, badges: p.badges });
  if (gained) toast(`⭐ +${gained} ${t("xp_gain")}`);
  if (levelOf(p.xp) > before) setTimeout(() => toast(`🚀 ${t("level")} ${levelOf(p.xp)}!`), 900);
  newBadges.forEach((b, i) => setTimeout(() => toast(`${b.icon} ${t("earned")} <b>${esc(tr(b.name))}</b>`), 1800 + i * 1200));
  renderNav();
}

// ---------- header ----------
function renderNav() {
  const u = state.user, p = state.profile;
  $("#nav").innerHTML = `
    <a href="#/" class="brand">${kodi("kodi-sm")}<span>Claudy</span></a>
    <nav>
      ${u ? `<a href="#/belajar">${t("learn")}</a><a href="#/lencana">${t("badges")}</a>` : ""}
      <a href="#/langganan">${t("plans")}</a>
      ${state.admin ? `<a href="#/admin">${t("admin")}</a>` : ""}
    </nav>
    <div class="nav-right">
      ${p ? `<span class="pill" title="XP">Lv ${levelOf(p.xp)} · ⭐${p.xp}</span>` : ""}
      <button class="lang" id="langBtn" aria-label="Language">${getLang() === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}</button>
      ${u ? `<button class="ghost" id="outBtn">${t("logout")}</button>` : `<a class="btn small" href="#/masuk">${t("login")}</a>`}
    </div>`;
  $("#langBtn").onclick = () => { setLang(getLang() === "id" ? "en" : "id"); renderNav(); route(); };
  $("#outBtn") && ($("#outBtn").onclick = async () => { await B.signOut(); location.hash = "#/"; });
  $("#demo").hidden = B.mode !== "demo";
  $("#demo").textContent = t("demo_banner");
}

// ---------- halaman ----------
function home() {
  const pr = state.pricing;
  view.innerHTML = `
  <section class="hero">
    <div>${kodi("kodi-xl bob")}</div>
    <div>
      <h1>Claudy</h1>
      <p class="lead">${esc(t("tagline"))}</p>
      <ul class="ticks">${t("hero_points").map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <a class="btn big" href="${state.user ? "#/belajar" : "#/masuk"}">${t("start")} →</a>
    </div>
  </section>
  <h2>${t("modules")}</h2>
  <div class="grid">${MODULES.map(m => `
    <div class="card mod"><div class="mod-ic">${m.icon}</div><b>${m.id}. ${esc(tr(m.title))}</b>
      <small>${esc(tr(m.level))} · ${m.lessons.length} ${t("lessons")}</small></div>`).join("")}
  </div>
  ${pr ? `<p class="center muted">${t("monthly")} ${rupiah(pr.monthly)} ${t("per_month")} · ${t("lifetime")} ${rupiah(pr.lifetime)} ${t("once")}</p>` : ""}`;
}

function loginView() {
  if (state.user) { location.hash = "#/belajar"; return; }
  let signup = false;
  const draw = () => {
    view.innerHTML = `
    <div class="card narrow center">
      ${kodi("kodi-lg")}
      <h2>${t("login_title")}</h2>
      <button class="btn big full" id="g">🔵 ${t("google")}</button>
      <p class="muted">${t("or")}</p>
      <form id="f" class="stack">
        ${signup ? `<input name="name" placeholder="${t("name")}" autocomplete="nickname">` : ""}
        <input name="email" type="email" required placeholder="${t("email")}" autocomplete="email">
        <input name="pw" type="password" required minlength="6" placeholder="${t("password")}" autocomplete="${signup ? "new-password" : "current-password"}">
        <button class="btn full">${signup ? t("sign_up") : t("sign_in")}</button>
      </form>
      <button class="link" id="sw">${signup ? t("have_account") : t("no_account")}</button>
      <p class="err" id="e"></p>
    </div>`;
    $("#g").onclick = () => B.signInGoogle().catch(e => $("#e").textContent = errMsg(e));
    $("#sw").onclick = () => { signup = !signup; draw(); };
    $("#f").onsubmit = ev => {
      ev.preventDefault(); const f = new FormData(ev.target);
      (signup ? B.signUpEmail(f.get("name"), f.get("email"), f.get("pw")) : B.signInEmail(f.get("email"), f.get("pw")))
        .catch(e => $("#e").textContent = errMsg(e));
    };
  };
  draw();
}

function needLogin() {
  view.innerHTML = `<div class="card narrow center">${kodi("kodi-lg")}<p>${t("need_login")}</p><a class="btn" href="#/masuk">${t("login")}</a></div>`;
}

function dashboard() {
  if (!state.user) return needLogin();
  const p = state.profile, lv = levelOf(p.xp), prem = isPremium(p);
  const inLevel = lv >= MAX_LEVEL ? XP_PER_LEVEL : p.xp % XP_PER_LEVEL;
  view.innerHTML = `
  <section class="card stats">
    ${kodi("kodi-md")}
    <div class="grow">
      <h2>Halo, ${esc(p.name)}!</h2>
      <div class="bar"><i style="width:${inLevel}%"></i></div>
      <small>${t("level")} ${lv} · ⭐ ${p.xp} XP · ${lv < MAX_LEVEL ? `${XP_PER_LEVEL - inLevel} ${t("next_level")}` : "MAX"}</small>
    </div>
    <div class="flame">🔥 <b>${p.streak?.count || 0}</b><small>${t("streak")}</small></div>
  </section>
  ${MODULES.map(m => {
    const n = m.lessons.filter(l => p.done[l.id]).length;
    return `<section class="module">
      <h3>${m.icon} ${m.id}. ${esc(tr(m.title))} <small class="muted">${n}/${m.lessons.length}</small></h3>
      <div class="lessons">${m.lessons.map(l => {
        const free = isFree(l.id), lock = !free && !prem, d = p.done[l.id];
        return `<a class="lesson ${d ? "done" : ""} ${lock ? "lock" : ""}" href="#/pelajaran/${l.id}">
          <span class="num">${d ? "✅" : lock ? "🔒" : l.id}</span>
          <span class="grow">${esc(tr(l.title))}</span>
          ${free ? `<span class="tag free">${t("free")}</span>` : `<span class="tag">${t("premium")}</span>`}
        </a>`; }).join("")}</div></section>`; }).join("")}`;
}

function badgesView() {
  if (!state.user) return needLogin();
  const have = state.profile.badges;
  view.innerHTML = `<h2>${t("badges")}</h2><div class="grid">${BADGES.map(b => `
    <div class="card badge ${have.includes(b.id) ? "" : "off"}"><div class="b-ic">${b.icon}</div>
    <b>${esc(tr(b.name))}</b><small>${esc(tr(b.how))}</small></div>`).join("")}</div>`;
}

// ---------- pelajaran ----------
let speaking = false;
function speak(text, btn) {
  if (!("speechSynthesis" in window)) return;
  if (speaking) { speechSynthesis.cancel(); speaking = false; btn.textContent = t("read_aloud"); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = getLang() === "en" ? "en-US" : "id-ID"; u.rate = 0.95;
  u.onend = () => { speaking = false; btn.textContent = t("read_aloud"); };
  speaking = true; btn.textContent = t("stop_read"); speechSynthesis.speak(u);
}

function shuffleQuiz(quiz, seed) {
  // acak urutan pilihan (tetap sama untuk pelajaran yang sama) supaya jawaban tidak selalu "B"
  let s = [...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 2 ** 32;
  return quiz.map(q => {
    const idx = q.options.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return { ...q, options: idx.map(i => q.options[i]), answer: idx.indexOf(q.answer) };
  });
}

async function lessonView(id) {
  const meta = ALL_LESSONS.find(l => l.id === id);
  if (!meta) { location.hash = "#/belajar"; return; }
  if (!state.user) return needLogin();
  const p = state.profile;
  const pos = ALL_LESSONS.indexOf(meta), next = ALL_LESSONS[pos + 1];
  if (!isFree(id) && !isPremium(p)) {
    const wc = state.pricing?.welcomeCode;
    view.innerHTML = `<div class="card narrow center">${kodi("kodi-lg")}<h2>🔒 ${t("gate_title")}</h2>
      <p>${t("gate_text")}</p>${wc ? `<p class="offer">🎁 ${t("welcome_offer")} <b>${esc(wc)}</b></p>` : ""}
      <a class="btn big" href="#/langganan${wc ? "?kode=" + encodeURIComponent(wc) : ""}">${t("see_plans")}</a></div>`;
    return;
  }
  view.innerHTML = `<p class="muted">…</p>`;
  let data = isFree(id) ? state.content?.[id] : await B.getPaidLesson(id);
  const c = data?.[getLang()] || data?.id;
  const done = p.done[id];
  const mod = MODULES.find(m => m.id === meta.module);
  if (!c) {
    view.innerHTML = `<a class="link" href="#/belajar">← ${t("back")}</a><div class="card narrow center">${kodi("kodi-lg")}<h2>${esc(tr(meta.title))}</h2><p>${t("coming")}</p></div>`;
    return;
  }
  const html = DOMPurify.sanitize(marked.parse(c.body));
  const quiz = shuffleQuiz(c.quiz || [], id);
  view.innerHTML = `
  <a class="link" href="#/belajar">← ${t("back")}</a>
  <article class="card lesson-page">
    <div class="lesson-head">${kodi("kodi-md")}<div><small class="muted">${mod.icon} ${esc(tr(mod.title))} · ${id}</small><h1>${esc(c.title)}</h1></div></div>
    <div class="tools"><button class="ghost" id="tts">${t("read_aloud")}</button>
      <label class="switch"><input type="checkbox" id="big" ${document.body.classList.contains("big") ? "checked" : ""}> ${t("big_text")}</label></div>
    ${(data.images || []).slice(0, 1).map(lessonImg).join("")}
    ${data.video ? `<div class="video"><iframe src="https://drive.google.com/file/d/${esc(data.video)}/preview" allow="autoplay" allowfullscreen></iframe></div>` : ""}
    <div class="md" id="md">${html}</div>
    ${(data.images || []).slice(1).map((s, i) => lessonImg(s, i + 1)).join("")}
    ${done ? `<p class="done-note">${t("done_already")}</p>` : `
    <section class="mission"><h3>🎯 ${t("mission")}</h3><p>${esc(tr(meta.mission))}</p>
      <label class="check"><input type="checkbox" id="mis"> ${t("mission_done")} <b>+${XP.mission} XP</b></label></section>
    ${quiz.length ? `<section class="quiz"><h3>🧠 ${t("quiz")}</h3>${quiz.map((q, i) => `
      <fieldset data-q="${i}"><legend>${i + 1}. ${esc(q.q)}</legend>${q.options.map((o, j) => `
        <label class="opt"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")}
        <p class="note" hidden>${esc(q.note)}</p></fieldset>`).join("")}
      <button class="btn" id="chk">${t("check")}</button><p id="qres"></p></section>` : ""}
    <button class="btn big full" id="fin" ${quiz.length ? "disabled" : ""}>${t("finish")} +${XP.lesson} XP</button>`}
    ${next ? `<a class="btn ghost full" href="#/pelajaran/${next.id}">${t("next")}: ${esc(tr(next.title))} →</a>` : ""}
  </article>`;
  $("#tts").onclick = e => speak($("#md").innerText, e.target);
  $("#big").onchange = e => { document.body.classList.toggle("big", e.target.checked); try { localStorage.setItem("claudy-big", e.target.checked ? "1" : ""); } catch {} };
  if (done) return;
  let perfect = false;
  $("#chk") && ($("#chk").onclick = () => {
    let ok = 0;
    quiz.forEach((q, i) => {
      const fs = view.querySelector(`[data-q="${i}"]`), pick = fs.querySelector("input:checked");
      fs.querySelectorAll(".opt").forEach((lb, j) => { lb.classList.toggle("right", j === q.answer); lb.classList.toggle("wrong", pick && +pick.value === j && j !== q.answer); });
      if (q.note) fs.querySelector(".note").hidden = false;
      if (pick && +pick.value === q.answer) ok++;
    });
    perfect = ok === quiz.length;
    $("#qres").innerHTML = perfect ? `<b>${t("perfect")}</b>` : `${ok}/${quiz.length}. ${t("wrong")}`;
    $("#fin").disabled = false;
  });
  $("#fin").onclick = async () => {
    const mission = $("#mis").checked;
    $("#fin").disabled = true;
    const gained = XP.lesson + (perfect ? XP.quiz : 0) + (mission ? XP.mission : 0);
    await award({ [id]: { at: Date.now(), quiz: perfect, mission } }, gained);
    if (id === ALL_LESSONS[FREE_COUNT - 1].id && !isPremium(p)) { location.hash = "#/pelajaran/" + next.id; return; } // langsung tunjukkan tawaran setelah 2.2
    lessonView(id); scrollTo(0, 0);
  };
}

// ---------- langganan ----------
async function plansView(params) {
  const pr = state.pricing || await B.getPricing();
  const p = state.profile;
  let code = (params.get("kode") || "").toUpperCase(), voucher = null;
  const status = params.get("status");
  const draw = () => {
    const price = plan => { const base = pr[plan]; const ok = voucher && !voucherProblem(voucher, plan); return { base, final: ok ? finalPrice(base, voucher) : base, ok }; };
    const card = (plan, desc, unit) => { const x = price(plan); return `
      <div class="card plan ${plan === "lifetime" ? "best" : ""}">
        <h3>${t(plan)}</h3>
        <div class="price">${x.ok && x.final !== x.base ? `<s>${rupiah(x.base)}</s> ` : ""}<b>${rupiah(x.final)}</b> <small>${t(unit)}</small></div>
        <p>${t(desc)}</p>
        <button class="btn full" data-plan="${plan}">${t("pay")}</button>
      </div>`; };
    view.innerHTML = `
      <h2>${t("plans")}</h2>
      ${status ? `<p class="offer">${isPremium(p) ? t("paid_ok") : t("pay_wait")}</p>` : ""}
      ${p && isPremium(p) ? `<p class="offer">✅ ${t("your_plan")}: <b>${t(p.plan)}</b>, ${p.plan === "lifetime" ? t("forever") : t("active_until") + " " + fmtDate(p.premiumUntil)}</p>` : ""}
      <div class="row voucher"><input id="vc" placeholder="${t("voucher")}" value="${esc(code)}"><button class="btn ghost" id="va">${t("apply")}</button></div>
      <p id="vm" class="${voucher ? "ok" : "err"}"></p>
      <div class="grid two">${card("monthly", "monthly_desc", "per_month")}${card("lifetime", "lifetime_desc", "once")}</div>
      <p class="muted center">${t("no_disclaimer")}</p>`;
    $("#va").onclick = applyCode;
    view.querySelectorAll("[data-plan]").forEach(b => b.onclick = async () => {
      if (!state.user) { location.hash = "#/masuk"; return; }
      b.disabled = true;
      try {
        const r = await B.checkout(state.user, b.dataset.plan, voucher ? voucher.code : null);
        if (r.status === "paid") { state.profile = await B.loadProfile(state.user); toast(t("paid_ok")); location.hash = "#/belajar"; }
      } catch (e) { $("#vm").className = "err"; $("#vm").textContent = errMsg(e); b.disabled = false; }
    });
  };
  async function applyCode() {
    code = $("#vc").value.trim().toUpperCase();
    voucher = code ? await B.getVoucher(code) : null;
    const prob = code ? voucherProblem(voucher, "monthly") && voucherProblem(voucher, "lifetime") : null;
    if (prob) voucher = null;
    draw();
    $("#vm").textContent = !code ? "" : prob ? t("v_" + prob) : `${t("v_ok")} ${voucher.type === "percent" ? voucher.value + "%" : rupiah(voucher.value)}`;
  }
  draw();
  if (code) applyCode();
}

// ---------- panel admin ----------
async function adminView(params) {
  if (!state.user) return needLogin();
  if (!state.admin) { view.innerHTML = `<div class="card narrow center"><p>Khusus admin.</p></div>`; return; }
  const tab = params.get("tab") || "harga";
  const tabs = { harga: "💰 Harga", voucher: "🎟️ Voucher", pengguna: "👥 Pengguna", pesanan: "🧾 Pesanan", konten: "📚 Konten berbayar" };
  view.innerHTML = `<h2>Panel Admin</h2><div class="tabs">${Object.entries(tabs).map(([k, v]) => `<a class="${k === tab ? "on" : ""}" href="#/admin?tab=${k}">${v}</a>`).join("")}</div><div id="adm" class="card"></div>`;
  const box = $("#adm");
  if (tab === "harga") {
    const pr = await B.getPricing();
    box.innerHTML = `<form id="pf" class="stack">
      <label>Harga Bulanan (Rp, per 30 hari)<input name="monthly" type="number" min="0" step="1000" value="${pr.monthly}" required></label>
      <label>Harga Lifetime (Rp, sekali bayar)<input name="lifetime" type="number" min="0" step="1000" value="${pr.lifetime}" required></label>
      <label>Voucher sambutan (muncul di halaman terkunci setelah pelajaran gratis selesai, boleh kosong)<input name="welcomeCode" value="${esc(pr.welcomeCode || "")}" placeholder="mis. SELAMATDATANG"></label>
      <button class="btn">Simpan harga</button></form>`;
    $("#pf").onsubmit = async e => {
      e.preventDefault(); const f = new FormData(e.target);
      const np = { monthly: +f.get("monthly"), lifetime: +f.get("lifetime"), welcomeCode: f.get("welcomeCode").trim().toUpperCase() };
      await B.setPricing(np); state.pricing = await B.getPricing(); toast("✅ Harga disimpan");
    };
  }
  if (tab === "voucher") {
    const list = await B.listVouchers();
    const status = v => voucherProblem(v, null) ? { inactive: "Nonaktif", expired: "Kedaluwarsa", usedup: "Habis" }[voucherProblem(v, null)] : "Aktif";
    box.innerHTML = `
      <h3>Buat / ubah voucher</h3>
      <form id="vf" class="form-grid">
        <label>Kode<input name="code" required pattern="[A-Za-z0-9_]{3,30}" title="3-30 huruf/angka, tanpa spasi" placeholder="RAMADAN30"></label>
        <label>Jenis<select name="type"><option value="percent">Persen (%)</option><option value="fixed">Potongan (Rp)</option></select></label>
        <label>Nilai<input name="value" type="number" min="1" required placeholder="30 atau 20000"></label>
        <label>Batas pemakaian (0 = tanpa batas)<input name="maxUses" type="number" min="0" value="100"></label>
        <label>Berlaku sampai (kosong = selamanya)<input name="expires" type="datetime-local"></label>
        <label>Berlaku untuk<select name="plans"><option value="">Semua paket</option><option value="monthly">Bulanan saja</option><option value="lifetime">Lifetime saja</option></select></label>
        <label class="check"><input type="checkbox" name="active" checked> Aktif</label>
        <button class="btn">Simpan voucher</button>
      </form>
      <h3>Daftar voucher (${list.length})</h3>
      <div class="table"><table><tr><th>Kode</th><th>Diskon</th><th>Terpakai</th><th>Sampai</th><th>Paket</th><th>Status</th><th></th></tr>
      ${list.map(v => `<tr><td><b>${esc(v.code)}</b></td><td>${v.type === "percent" ? v.value + "%" : rupiah(v.value)}</td>
        <td>${v.used || 0}${v.maxUses ? " / " + v.maxUses : ""}</td><td>${v.expiresAt ? fmtDate(v.expiresAt) : "∞"}</td>
        <td>${v.plans?.length ? v.plans.map(x => t(x)).join(", ") : "Semua"}</td><td>${status(v)}</td>
        <td class="nowrap"><button class="ghost small" data-edit="${esc(v.code)}">Ubah</button> <button class="ghost small" data-del="${esc(v.code)}">Hapus</button></td></tr>`).join("") || `<tr><td colspan="7" class="muted">Belum ada voucher.</td></tr>`}
      </table></div>`;
    const f = $("#vf");
    f.onsubmit = async e => {
      e.preventDefault(); const d = new FormData(f);
      const type = d.get("type"), value = +d.get("value");
      if (type === "percent" && value > 100) return toast("Persen maksimal 100");
      await B.saveVoucher({ code: d.get("code").trim().toUpperCase(), type, value, maxUses: +d.get("maxUses") || 0,
        expiresAt: d.get("expires") ? new Date(d.get("expires")).getTime() : null, plans: d.get("plans") ? [d.get("plans")] : [], active: !!d.get("active") });
      toast("✅ Voucher disimpan"); adminView(params);
    };
    box.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => {
      const v = list.find(x => x.code === b.dataset.edit);
      f.code.value = v.code; f.type.value = v.type; f.value.value = v.value; f.maxUses.value = v.maxUses || 0;
      f.expires.value = v.expiresAt ? new Date(v.expiresAt - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "";
      f.plans.value = v.plans?.[0] || ""; f.active.checked = v.active !== false; f.scrollIntoView({ behavior: "smooth" });
    });
    box.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
      if (b.dataset.armed) { await B.deleteVoucher(b.dataset.del); adminView(params); }
      else { b.dataset.armed = 1; b.textContent = "Yakin?"; }
    });
  }
  if (tab === "pengguna") {
    const users = await B.listUsers();
    box.innerHTML = `<p class="muted">Untuk pembayaran manual (transfer), buka akses di sini.</p><div class="table"><table>
      <tr><th>Nama</th><th>Email</th><th>XP</th><th>Pelajaran</th><th>Paket</th><th>Atur akses</th></tr>
      ${users.map(u => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.xp || 0}</td><td>${Object.keys(u.done || {}).length}/40</td>
        <td>${isPremium(u) ? (u.plan === "lifetime" ? "Lifetime" : "Bulanan s/d " + fmtDate(u.premiumUntil)) : "Gratis"}</td>
        <td class="nowrap"><button class="ghost small" data-u="${u.uid}" data-p="monthly">+30 hari</button> <button class="ghost small" data-u="${u.uid}" data-p="lifetime">Lifetime</button> <button class="ghost small" data-u="${u.uid}" data-p="none">Cabut</button></td></tr>`).join("")}
    </table></div>`;
    box.querySelectorAll("[data-u]").forEach(b => b.onclick = async () => {
      await B.setUserPlan(b.dataset.u, b.dataset.p);
      if (b.dataset.u === state.user.uid) state.profile = await B.loadProfile(state.user);
      toast("✅ Akses diperbarui"); adminView(params);
    });
  }
  if (tab === "pesanan") {
    const orders = await B.listOrders();
    const sum = orders.filter(o => o.status === "paid").reduce((a, o) => a + (o.amount || 0), 0);
    box.innerHTML = `<p>Total lunas (100 pesanan terakhir): <b>${rupiah(sum)}</b></p><div class="table"><table>
      <tr><th>Waktu</th><th>Email</th><th>Paket</th><th>Voucher</th><th>Jumlah</th><th>Status</th></tr>
      ${orders.map(o => `<tr><td>${fmtDate(o.at)}</td><td>${esc(o.email)}</td><td>${t(o.plan)}</td><td>${esc(o.voucher || "-")}</td><td>${rupiah(o.amount)}</td><td>${esc(o.status)}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Belum ada pesanan.</td></tr>`}
    </table></div>`;
  }
  if (tab === "konten") {
    box.innerHTML = `<p>Materi pelajaran berbayar (setelah 10 pelajaran gratis) <b>tidak</b> ditaruh di file website supaya tidak bisa dibuka orang yang belum bayar. Jalankan <code>python tools/build_content.py</code>, lalu unggah file <code>paid-lessons.json</code> yang dihasilkan di sini.</p>
      <input type="file" id="pj" accept=".json,application/json"> <p id="pr"></p>`;
    $("#pj").onchange = async e => {
      try { const obj = JSON.parse(await e.target.files[0].text()); const n = await B.uploadPaidLessons(obj); $("#pr").textContent = `✅ ${n} pelajaran diunggah.`; }
      catch (err) { $("#pr").textContent = "Gagal: " + errMsg(err); }
    };
  }
}

// ---------- router ----------
async function route() {
  if (!state.ready) return;
  speechSynthesis?.cancel?.(); speaking = false;
  const [path, qs] = (location.hash.slice(1) || "/").split("?");
  const params = new URLSearchParams(qs || "");
  const parts = path.split("/").filter(Boolean);
  try {
    switch (parts[0]) {
      case undefined: state.user ? dashboard() : home(); break;
      case "masuk": loginView(); break;
      case "belajar": dashboard(); break;
      case "lencana": badgesView(); break;
      case "pelajaran": await lessonView(parts[1]); break;
      case "langganan": await plansView(params); break;
      case "admin": await adminView(params); break;
      case "tentang": home(); break;
      default: home();
    }
  } catch (e) { console.error(e); view.innerHTML = `<div class="card err">${esc(errMsg(e))}</div>`; }
  window.scrollTo(0, 0);
}

addEventListener("hashchange", route);
try { if (localStorage.getItem("claudy-big")) document.body.classList.add("big"); } catch {}
[state.content, state.pricing] = await Promise.all([fetch("content/lessons.json").then(r => r.json()).catch(() => ({})), B.getPricing().catch(() => null)]);
B.init(async user => {
  state.user = user;
  state.profile = user ? await B.loadProfile(user) : null;
  state.admin = user ? await B.isAdmin(user.uid) : false;
  state.ready = true;
  renderNav();
  if (user && location.hash.startsWith("#/masuk")) location.hash = "#/belajar"; else route();
});
