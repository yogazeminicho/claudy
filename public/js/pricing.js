// Hitung harga akhir. Logika yang sama dipakai di functions/index.js (server).
export function voucherProblem(v, plan, now = Date.now()) {
  if (!v) return "notfound";
  if (v.active === false) return "inactive";
  if (v.expiresAt && now > v.expiresAt) return "expired";
  if (v.maxUses && (v.used || 0) >= v.maxUses) return "usedup";
  if (plan && v.plans && v.plans.length && !v.plans.includes(plan)) return "plan";
  return null;
}
export function finalPrice(base, v) {
  if (!v) return base;
  const off = v.type === "percent" ? Math.round(base * Math.min(100, v.value) / 100) : v.value;
  return Math.max(0, base - off);
}
export const rupiah = n => "Rp" + Math.round(n).toLocaleString("id-ID");
