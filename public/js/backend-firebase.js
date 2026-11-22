// Mode PRODUKSI: Firebase Auth + Firestore + Cloud Functions (Midtrans).
import { voucherProblem, finalPrice } from "./pricing.js";
import { firebaseConfig, functionsRegion } from "./config.js";
const V = "10.12.2";
const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
const A = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
const F = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
const Fn = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-functions.js`);

const app = initializeApp(firebaseConfig);
const auth = A.getAuth(app);
const db = F.getFirestore(app);
const fns = Fn.getFunctions(app, functionsRegion);
const toMs = t => (t && t.toMillis) ? t.toMillis() : t ?? null;

export const mode = "firebase";
export function init(cb) {
  A.onAuthStateChanged(auth, u => cb(u ? { uid: u.uid, name: u.displayName || (u.email || "").split("@")[0], email: u.email } : null));
}
export async function signInGoogle() { await A.signInWithPopup(auth, new A.GoogleAuthProvider()); }
export async function signUpEmail(name, email, pw) {
  const c = await A.createUserWithEmailAndPassword(auth, email, pw);
  if (name) await A.updateProfile(c.user, { displayName: name });
}
export async function signInEmail(email, pw) { await A.signInWithEmailAndPassword(auth, email, pw); }
export async function signOut() { await A.signOut(auth); }

export async function loadProfile(user) {
  const ref = F.doc(db, "users", user.uid);
  const s = await F.getDoc(ref);
  if (!s.exists()) {
    const p = { name: user.name, email: user.email, xp: 0, done: {}, badges: [], streak: { count: 0, best: 0, last: null }, createdAt: Date.now() };
    await F.setDoc(ref, p);
    return { ...p, plan: null, premiumUntil: null };
  }
  const d = s.data();
  return { plan: null, premiumUntil: null, ...d, premiumUntil: toMs(d.premiumUntil) };
}
export async function saveProfile(uid, patch) {
  const { plan, premiumUntil, ...safe } = patch;
  await F.updateDoc(F.doc(db, "users", uid), safe);
}
export async function isAdmin(uid) {
  try { return (await F.getDoc(F.doc(db, "admins", uid))).exists(); } catch { return false; }
}

export async function getPricing() {
  const s = await F.getDoc(F.doc(db, "settings", "pricing"));
  return { monthly: 49000, lifetime: 249000, welcomeCode: "", ...(s.exists() ? s.data() : {}) };
}
export async function setPricing(p) { await F.setDoc(F.doc(db, "settings", "pricing"), p, { merge: true }); }
export async function getVoucher(code) {
  try { const s = await F.getDoc(F.doc(db, "vouchers", code.toUpperCase())); return s.exists() ? s.data() : null; }
  catch { return null; }
}
export async function listVouchers() {
  const q = await F.getDocs(F.collection(db, "vouchers"));
  return q.docs.map(d => d.data()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
export async function saveVoucher(v) {
  const ref = F.doc(db, "vouchers", v.code);
  const s = await F.getDoc(ref);
  await F.setDoc(ref, s.exists() ? v : { used: 0, createdAt: Date.now(), ...v }, { merge: true });
}
export async function deleteVoucher(code) { await F.deleteDoc(F.doc(db, "vouchers", code)); }

export async function checkout(user, plan, code) {
  // Harga & voucher dihitung ulang di server, jadi harga di browser tidak bisa diakali.
  const call = Fn.httpsCallable(fns, "createCheckout");
  const r = await call({ plan, code: code || null, returnUrl: location.origin + location.pathname + "#/langganan?status=selesai" });
  if (r.data.status === "paid") return { status: "paid", amount: 0 };
  location.href = r.data.redirectUrl; // halaman bayar Midtrans (QRIS, VA bank, e-wallet)
  return { status: "redirect" };
}
export async function listUsers() {
  const q = await F.getDocs(F.query(F.collection(db, "users"), F.orderBy("createdAt", "desc"), F.limit(200)));
  return q.docs.map(d => ({ uid: d.id, ...d.data(), premiumUntil: toMs(d.data().premiumUntil) }));
}
export async function setUserPlan(uid, plan) {
  const ref = F.doc(db, "users", uid);
  const u = (await F.getDoc(ref)).data() || {};
  let patch;
  if (plan === "lifetime") patch = { plan: "lifetime", premiumUntil: null };
  else if (plan === "monthly") patch = { plan: u.plan === "lifetime" ? "lifetime" : "monthly", premiumUntil: Math.max(Date.now(), toMs(u.premiumUntil) || 0) + 30 * 864e5 };
  else patch = { plan: null, premiumUntil: null };
  await F.updateDoc(ref, patch);
}
export async function listOrders() {
  const q = await F.getDocs(F.query(F.collection(db, "orders"), F.orderBy("at", "desc"), F.limit(100)));
  return q.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function getPaidLesson(id) {
  try { const s = await F.getDoc(F.doc(db, "paidLessons", id)); return s.exists() ? s.data() : null; }
  catch { return null; } // aturan Firestore menolak bila belum berlangganan
}
export async function uploadPaidLessons(obj) {
  const b = F.writeBatch(db);
  for (const [id, v] of Object.entries(obj)) b.set(F.doc(db, "paidLessons", id), v);
  await b.commit(); return Object.keys(obj).length;
}
