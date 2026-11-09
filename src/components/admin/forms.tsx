"use client";

import { createContext, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

const FormState = createContext<ActionState>(null);

/** A form bound to a server action: shows a saving state, a success or error message, and per-field errors. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, run] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <FormState.Provider value={state}>
      <form ref={ref} action={run} className={className} noValidate>
        {children}
        <FormMessage />
      </form>
    </FormState.Provider>
  );
}

function FormMessage() {
  const state = useContext(FormState);
  if (!state?.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={cn("mt-4 w-full rounded-chip px-4 py-3 text-[13px] font-medium", state.ok ? "bg-success/10 text-success" : "bg-error/10 text-error")}>
      {state.message}
    </p>
  );
}

export function FieldError({ name }: { name: string }) {
  const msg = useContext(FormState)?.fields?.[name];
  if (!msg) return null;
  return (
    <p id={`${name}-err`} className="mt-1.5 text-[12px] font-medium text-error">
      {msg}
    </p>
  );
}

export function useFieldInvalid(name: string) {
  return !!useContext(FormState)?.fields?.[name];
}

/** Labelled input with its error under it. */
export function Field({ label, name, hint, className, as = "input", children, ...rest }: { label: string; name: string; hint?: string; className?: string; as?: "input" | "textarea" | "select"; children?: ReactNode } & Record<string, unknown>) {
  const invalid = useFieldInvalid(name);
  const common = { id: `f-${name}`, name, className: "field", "aria-invalid": invalid || undefined, "aria-describedby": invalid ? `${name}-err` : hint ? `${name}-hint` : undefined, ...rest };
  return (
    <div className={className}>
      <label htmlFor={`f-${name}`} className="mb-1.5 block text-[12px] font-bold text-ink">
        {label}
      </label>
      {as === "textarea" ? <textarea {...common} /> : as === "select" ? <select {...common}>{children}</select> : <input {...common} />}
      {hint && !invalid && (
        <p id={`${name}-hint`} className="mt-1.5 text-[12px] text-muted">
          {hint}
        </p>
      )}
      <FieldError name={name} />
    </div>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="check mt-0.5" />
      <span>
        <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
        {hint && <span className="block text-[12px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function Submit({ children, pendingText = "Saving…", variant = "primary", className }: { children: ReactNode; pendingText?: string; variant?: "primary" | "outline"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={cn("btn btn-sm", variant === "primary" ? "btn-primary" : "btn-outline", className)}>
      {pending ? pendingText : children}
    </button>
  );
}

/** A one-click action (toggle, delete) with an optional confirm step. */
export function QuickAction({ action, fields, label, confirm, tone = "default" }: { action: (form: FormData) => Promise<void>; fields: Record<string, string>; label: string; confirm?: string; tone?: "default" | "danger" }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <QuickButton label={label} tone={tone} />
    </form>
  );
}

function QuickButton({ label, tone }: { label: string; tone: "default" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("inline-flex h-9 items-center rounded-full border px-3.5 text-[12px] font-semibold transition-colors disabled:opacity-50", tone === "danger" ? "border-error/30 text-error hover:bg-error hover:text-cream" : "border-line text-ink hover:border-burgundy hover:text-burgundy")}>
      {pending ? "…" : label}
    </button>
  );
}
