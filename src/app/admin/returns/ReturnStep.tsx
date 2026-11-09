"use client";

import { updateReturnStatus } from "@/app/admin/actions";
import { ActionForm, Submit } from "@/components/admin/forms";

export function ReturnStep({ returnId, options }: { returnId: string; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <ActionForm key={o.value} action={updateReturnStatus}>
          <input type="hidden" name="returnId" value={returnId} />
          <input type="hidden" name="status" value={o.value} />
          <Submit variant={options.length > 1 && o.value === "exchanged" ? "outline" : "primary"} pendingText="…">Mark {o.label.toLowerCase()}</Submit>
        </ActionForm>
      ))}
    </div>
  );
}
