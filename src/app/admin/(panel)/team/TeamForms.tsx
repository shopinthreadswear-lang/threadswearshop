"use client";

import { addStaff, updateStaff } from "@/app/admin/actions";
import { ActionForm, Field, Submit, Toggle } from "@/components/admin/forms";

export function AddStaffForm() {
  return (
    <ActionForm action={addStaff} resetOnSuccess className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" placeholder="Priya Shah" autoComplete="off" />
        <Field label="Email" name="email" type="email" placeholder="priya@…" autoComplete="off" />
        <Field label="Role" name="role" as="select" defaultValue="support">
          <option value="support">Support</option>
          <option value="manager">Manager</option>
          <option value="owner">Owner</option>
        </Field>
        <Field label="Password" name="password" type="text" autoComplete="new-password" hint="At least 10 characters with a letter and a number. Share it with them privately." />
      </div>
      <Submit pendingText="Adding…">Add to team</Submit>
    </ActionForm>
  );
}

export function StaffForm({ member }: { member: { id: string; role: "owner" | "manager" | "support"; active: boolean } }) {
  return (
    <ActionForm action={updateStaff} className="grid items-end gap-3 sm:grid-cols-[160px_1fr_auto]">
      <input type="hidden" name="staffId" value={member.id} />
      <Field label="Role" name="role" as="select" defaultValue={member.role}>
        <option value="support">Support</option>
        <option value="manager">Manager</option>
        <option value="owner">Owner</option>
      </Field>
      <Field label="New password (optional)" name="password" type="text" autoComplete="new-password" placeholder="Leave empty to keep" />
      <Submit variant="outline">Save</Submit>
      <div className="sm:col-span-3">
        <Toggle name="active" label="Can sign in" defaultChecked={member.active} hint="Turn off to block access without deleting them." />
      </div>
    </ActionForm>
  );
}
