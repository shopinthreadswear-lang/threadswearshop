/** Client-side mirrors of the server schemas — fast feedback; the server remains the authority. */
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
export const isPincode = (v: string) => /^[1-9]\d{5}$/.test(v.trim());

export function luhn(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i];
    if (dbl) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function cardBrand(n: string) {
  const d = n.replace(/\D/g, "");
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^(60|65|81|82|508)/.test(d)) return "RuPay";
  return "Card";
}

export function validExpiry(v: string) {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
  if (!m) return false;
  const exp = new Date(2000 + +m[2], +m[1]);
  return exp > new Date();
}
