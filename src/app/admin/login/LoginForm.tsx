"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, run] = useActionState<LoginState, FormData>(adminLogin, null);
  const [show, setShow] = useState(false);
  return (
    <form action={run} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-[12px] font-bold text-ink">Email</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required defaultValue={state?.email} className="field" aria-invalid={!!state?.error || undefined} />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-[12px] font-bold text-ink">Password</label>
        <div className="relative">
          <input id="admin-password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="field pr-20" aria-invalid={!!state?.error || undefined} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 my-auto h-9 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-chip bg-error/10 px-4 py-3 text-[13px] font-medium text-error">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className="btn btn-primary w-full">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
