import { fmtDate, getAdmin, ownerEmail, ROLE_HINT, ROLE_LABEL } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { Card, PageHeader, Pill } from "@/components/admin/bits";
import { QuickAction } from "@/components/admin/forms";
import { removeStaff } from "@/app/admin/actions";
import { AddStaffForm, StaffForm } from "./TeamForms";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  await getAdmin("team");
  const staff = await read((db) => (db.staff ?? []).map(({ passwordHash: _p, ...m }) => (void _p, m)));
  return (
    <>
      <PageHeader title="Team" sub="Give staff their own admin login, with only the access their job needs. Everything they change shows in the Activity log." />

      <Card title="Who can sign in">
        <ul className="divide-y divide-line">
          <li className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-ink">You (owner)</span>
              <span className="block truncate text-[12.5px] text-muted">{ownerEmail()} · login set in Vercel (ADMIN_EMAIL / ADMIN_PASSWORD)</span>
            </span>
            <Pill tone="good">{ROLE_LABEL.owner} · full access</Pill>
          </li>
          {staff.map((m) => (
            <li key={m.id} className="py-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    {m.name} {!m.active && <Pill tone="bad">Access off</Pill>}
                  </span>
                  <span className="block truncate text-[12.5px] text-muted">
                    {m.email} · added {fmtDate(m.createdAt)} · {m.lastLoginAt ? `last signed in ${fmtDate(m.lastLoginAt, true)}` : "hasn’t signed in yet"}
                  </span>
                </span>
                <QuickAction action={removeStaff} fields={{ staffId: m.id }} label="Remove" tone="danger" confirm={`Remove ${m.name} from the team? They’ll be signed out straight away.`} />
              </div>
              <StaffForm member={{ id: m.id, role: m.role, active: m.active }} />
            </li>
          ))}
        </ul>
        {!staff.length && <p className="mt-2 text-[13px] text-muted">No team members yet. Add someone below.</p>}
      </Card>

      <Card title="Add a team member" className="mt-4">
        <ul className="mb-5 grid gap-2 text-[13px] text-muted sm:grid-cols-2">
          {(Object.keys(ROLE_HINT) as (keyof typeof ROLE_HINT)[]).map((r) => (
            <li key={r} className="rounded-chip border border-line bg-ivory px-3 py-2.5">
              <span className="font-semibold text-ink">{ROLE_LABEL[r]}:</span> {ROLE_HINT[r]}
            </li>
          ))}
        </ul>
        <AddStaffForm />
      </Card>
    </>
  );
}
