// Mode DEMO: semua data disimpan di browser (localStorage). Tidak ada pembayaran sungguhan.
import { voucherProblem, finalPrice } from "./pricing.js";

const K = "claudy-demo-v1";
const load = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch { return {}; } };
const db = Object.assign({ users: {}, accounts: {}, vouchers: {}, orders: [], paid: {}, session: null,
  pricing: { monthly: 49000, lifetime: 249000, welcomeCode: "" } }, load());
const save = () => { try { localStorage.setItem(K, JSON.stringify(db)); } catch {} };
let listener = () => {};
const emit = () => { const u = db.session && db.users[db.session]; listener(u ? { uid: db.session, name: u.name, email: u.email } : null); };
const newProfile = (name, email) => ({ name, email, xp: 0, done: {}, badges: [], streak: { count: 0, best: 0, last: null }, plan: null, premiumUntil: null, createdAt: Date.now() });

export const mode = "demo";
export function init(cb) { listener = cb; emit(); }
export async function signInGoogle() {
  const email = "demo@claudy.app";
  if (!db.users.demo) db.users.demo = newProfile("Teman Kodi", email);
  db.session = "demo"; save(); emit();
}
export async function signUpEmail(name, email, pw) {
  email = email.trim().toLowerCase();
  if (db.accounts[email]) throw new Error("auth/email-already-in-use");
  if ((pw || "").length < 6) throw new Error("auth/weak-password");
  const uid = "u" + Date.now();
  db.accounts[email] = { uid, pw }; db.users[uid] = newProfile(name || email.split("@")[0], email);
  db.session = uid; save(); emit();
}
export async function signInEmail(email, pw) {
  const a = db.accounts[email.trim().toLowerCase()];
  if (!a || a.pw !== pw) throw new Error("auth/invalid-credential");
  db.session = a.uid; save(); emit();
}
export async function signOut() { db.session = null; save(); emit(); }
export async function loadProfile(user) { return structuredClone(db.users[user.uid]); }
export async function saveProfile(uid, patch) {
  const { plan, premiumUntil, ...safe } = patch; // sama seperti aturan Firestore
  Object.assign(db.users[uid], safe); save();
}
export async function isAdmin() { return true; } // demo: semua orang boleh buka admin

export async function getPricing() { return { ...db.pricing }; }
export async function setPricing(p) { db.pricing = { ...db.pricing, ...p }; save(); }
export async function getVoucher(code) { const v = db.vouchers[code.toUpperCase()]; return v ? { ...v } : null; }
export async function listVouchers() { return Object.values(db.vouchers).sort((a, b) => b.createdAt - a.createdAt); }
export async function saveVoucher(v) { db.vouchers[v.code] = { used: 0, createdAt: Date.now(), ...db.vouchers[v.code], ...v }; save(); }
export async function deleteVoucher(code) { delete db.vouchers[code]; save(); }

export async function checkout(user, plan, code) {
  const base = db.pricing[plan];
  let v = null;
  if (code) { v = await getVoucher(code); const p = voucherProblem(v, plan); if (p) throw new Error("voucher/" + p); }
  const amount = finalPrice(base, v);
  db.orders.unshift({ id: "DEMO-" + Date.now(), uid: user.uid, email: user.email, plan, voucher: v?.code || null, amount, status: "paid", at: Date.now() });
  if (v) db.vouchers[v.code].used = (db.vouchers[v.code].used || 0) + 1;
  grant(user.uid, plan); save();
  return { status: "paid", amount };
}
function grant(uid, plan) {
  const u = db.users[uid];
  if (plan === "lifetime") { u.plan = "lifetime"; u.premiumUntil = null; }
  else if (plan === "monthly") { u.plan = u.plan === "lifetime" ? "lifetime" : "monthly"; u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + 30 * 864e5; }
  else { u.plan = null; u.premiumUntil = null; }
}
export async function listUsers() { return Object.entries(db.users).map(([uid, u]) => ({ uid, ...u })); }
export async function setUserPlan(uid, plan) { grant(uid, plan); save(); }
export async function listOrders() { return db.orders.slice(0, 100); }
export async function getPaidLesson(id) { return db.paid[id] || null; }
export async function uploadPaidLessons(obj) { Object.assign(db.paid, obj); save(); return Object.keys(obj).length; }
