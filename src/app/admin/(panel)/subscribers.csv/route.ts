import { getAdminSession } from "@/lib/server/admin";
import { read } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** Newsletter list as a spreadsheet. Admins only. */
export async function GET() {
  if (!(await getAdminSession())) return new Response("Not found", { status: 404 });
  const rows = await read((db) => db.newsletter.map((s) => [s.email, s.source, s.createdAt]));
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = [["email", "source", "signed_up"], ...rows].map((r) => r.map((v) => cell(String(v))).join(",")).join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="threadsware-subscribers-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
