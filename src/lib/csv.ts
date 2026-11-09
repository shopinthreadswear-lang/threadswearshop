/** Minimal RFC 4180 CSV helpers (quotes, commas and newlines inside cells). */

const cell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  // Neutralise spreadsheet formulas in exported text (=, +, -, @ at the start).
  const safe = /^[=+\-@]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCSV(header: string[], rows: unknown[][]) {
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

export function parseCSV(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((x) => x.trim())) out.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim())) out.push(row);
  return out;
}

/** Rows as objects keyed by the (lower-cased, trimmed) header. */
export function csvObjects(text: string) {
  const [head, ...rows] = parseCSV(text);
  if (!head) return { columns: [] as string[], rows: [] as Record<string, string>[] };
  const columns = head.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return { columns, rows: rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, (r[i] ?? "").trim().replace(/^'(?=[=+\-@])/, "")]))) };
}
