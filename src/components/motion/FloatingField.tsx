"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Check } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

type Common = { label: string; error?: string; valid?: boolean; className?: string };

/** Input with an animated floating label, inline error and success tick. The label is a real <label>. */
export function FloatingInput({ label, error, valid, className, id: idProp, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={className}>
      <div className="ffield">
        <input id={id} placeholder=" " className="field" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
        <label htmlFor={id}>{label}</label>
        {valid && !error && <Check size={15} className="ok-tick" aria-hidden />}
      </div>
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FloatingTextarea({ label, error, className, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={className}>
      <div className="ffield is-textarea">
        <textarea id={id} placeholder=" " className="field" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
        <label htmlFor={id}>{label}</label>
      </div>
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FloatingSelect({ label, className, children, ...props }: Common & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={cn(className)}>
      <div className="ffield is-select">
        <select id={id} className="field pt-4" {...props}>
          {children}
        </select>
        <label htmlFor={id}>{label}</label>
      </div>
    </div>
  );
}
