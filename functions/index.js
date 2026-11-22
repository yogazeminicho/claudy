// Server pembayaran Claudy (Firebase Cloud Functions + Midtrans Snap).
// Harga dan voucher SELALU dihitung di sini, bukan di browser, supaya tidak bisa diakali.
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "node:crypto";

initializeApp();
const db = getFirestore();
const MIDTRANS_SERVER_KEY = defineSecret("MIDTRANS_SERVER_KEY");
const MIDTRANS_PRODUCTION = defineString("MIDTRANS_PRODUCTION", { default: "false" });
const REGION = "asia-southeast2";

// sama dengan public/js/pricing.js
function voucherProblem(v, plan, now = Date.now()) {
  if (!v) return "notfound";
  if (v.active === false) return "inactive";
  if (v.expiresAt && now > v.expiresAt) return "expired";
  if (v.maxUses && (v.used || 0) >= v.maxUses) return "usedup";
  if (plan && v.plans && v.plans.length && !v.plans.includes(plan)) return "plan";
  return null;
}
const finalPrice = (base, v) => !v ? base : Math.max(0, base - (v.type === "percent" ? Math.round(base * Math.min(100, v.value) / 100) : v.value));

// Firestore: semua tx.get harus sebelum penulisan, jadi data user (u) dibaca lebih dulu oleh pemanggil.
function grant(tx, uid, plan, u = {}) {
  const ref = db.doc(`users/${uid}`);
  if (plan === "lifetime") tx.set(ref, { plan: "lifetime", premiumUntil: null }, { merge: true });
  else tx.set(ref, { plan: u.plan === "lifetime" ? "lifetime" : "monthly", premiumUntil: Math.max(Date.now(), u.premiumUntil || 0) + 30 * 864e5 }, { merge: true });
}

export const createCheckout = onCall({ region: REGION, secrets: [MIDTRANS_SERVER_KEY] }, async req => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Login dulu");
  const { plan, code, returnUrl } = req.data || {};
  if (!["monthly", "lifetime"].includes(plan)) throw new HttpsError("invalid-argument", "Paket tidak dikenal");
  const pricing = { monthly: 49000, lifetime: 249000, ...((await db.doc("settings/pricing").get()).data() || {}) };
  let v = null;
  if (code) {
    v = (await db.doc(`vouchers/${String(code).toUpperCase()}`).get()).data() || null;
    const p = voucherProblem(v, plan);
    if (p) throw new HttpsError("failed-precondition", "voucher/" + p);
  }
  const amount = finalPrice(pricing[plan], v);
  const orderRef = db.collection("orders").doc();
  const order = { uid: req.auth.uid, email: req.auth.token.email || "", plan, voucher: v?.code || null, amount, status: "pending", at: Date.now() };

  if (amount === 0) { // voucher 100%: langsung aktif tanpa Midtrans
    await db.runTransaction(async tx => {
      const u = (await tx.get(db.doc(`users/${req.auth.uid}`))).data() || {};
      const vr = v ? db.doc(`vouchers/${v.code}`) : null;
      if (vr && voucherProblem((await tx.get(vr)).data(), plan)) throw new HttpsError("failed-precondition", "voucher/usedup");
      if (vr) tx.update(vr, { used: FieldValue.increment(1) });
      grant(tx, req.auth.uid, plan, u);
      tx.set(orderRef, { ...order, status: "paid" });
    });
    return { status: "paid" };
  }

  await orderRef.set(order);
  const base = MIDTRANS_PRODUCTION.value() === "true" ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  const res = await fetch(`${base}/snap/v1/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: "Basic " + Buffer.from(MIDTRANS_SERVER_KEY.value() + ":").toString("base64") },
    body: JSON.stringify({
      transaction_details: { order_id: orderRef.id, gross_amount: amount },
      item_details: [{ id: plan, price: amount, quantity: 1, name: plan === "lifetime" ? "Claudy Lifetime" : "Claudy Bulanan (30 hari)" }],
      customer_details: { email: order.email },
      callbacks: { finish: returnUrl },
    }),
  });
  const j = await res.json();
  if (!res.ok) { await orderRef.update({ status: "error", error: JSON.stringify(j).slice(0, 500) }); throw new HttpsError("internal", "Gagal membuat pembayaran"); }
  return { status: "redirect", redirectUrl: j.redirect_url };
});

// Pasang URL fungsi ini di Midtrans Dashboard > Settings > Payment > Notification URL
export const midtransWebhook = onRequest({ region: REGION, secrets: [MIDTRANS_SERVER_KEY] }, async (req, res) => {
  const n = req.body || {};
  const sig = crypto.createHash("sha512").update(n.order_id + n.status_code + n.gross_amount + MIDTRANS_SERVER_KEY.value()).digest("hex");
  if (sig !== n.signature_key) { res.status(403).send("bad signature"); return; }
  const ref = db.doc(`orders/${n.order_id}`);
  const ok = n.transaction_status === "settlement" || (n.transaction_status === "capture" && n.fraud_status === "accept");
  const failed = ["deny", "cancel", "expire", "failure"].includes(n.transaction_status);
  await db.runTransaction(async tx => {
    const o = (await tx.get(ref)).data();
    if (!o || o.status === "paid") return; // sudah diproses
    const u = (await tx.get(db.doc(`users/${o.uid}`))).data() || {};
    if (ok) {
      if (Math.round(Number(n.gross_amount)) !== o.amount) { tx.update(ref, { status: "amount_mismatch" }); return; }
      if (o.voucher) tx.update(db.doc(`vouchers/${o.voucher}`), { used: FieldValue.increment(1) });
      grant(tx, o.uid, o.plan, u);
      tx.update(ref, { status: "paid", paidAt: Date.now(), method: n.payment_type || null });
    } else if (failed) tx.update(ref, { status: n.transaction_status });
  });
  res.send("ok");
});
