"use client";

import { useState } from "react";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function NewsletterForm({ source = "footer", light = false, className, onDone }: { source?: string; light?: boolean; className?: string; onDone?: () => void }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      setMsg("Enter a valid email address.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, source }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setState("done");
      setMsg(json.already ? "You’re already on the list — welcome back." : "Welcome to Threads Ware. Your 10% code WELCOME10 is on its way.");
      track({ name: "newsletter_signup", source });
      try {
        localStorage.setItem("tw.subscribed", "1");
      } catch {}
      onDone?.();
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (state === "done")
    return (
      <p className={cn("flex items-start gap-3 text-[14px]", light ? "text-ivory" : "text-ink", className)} role="status">
        <Check size={18} className="mt-0.5 shrink-0 text-champagne" /> {msg}
      </p>
    );

  return (
    <form onSubmit={submit} className={className} noValidate>
      <div className={cn("flex items-center border-b transition-colors focus-within:border-current", light ? "border-ivory/40 text-ivory" : "border-ink/30 text-ink")}>
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          autoComplete="email"
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? `nl-${source}-err` : undefined}
          className={cn("h-14 flex-1 bg-transparent text-[15px] focus:outline-none", light ? "placeholder:text-ivory/45" : "placeholder:text-faint")}
        />
        <button type="submit" disabled={state === "loading"} className="group flex items-center gap-3 py-3 pl-4 label-sm">
          {state === "loading" ? "Subscribing…" : "Subscribe"}
          <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
        </button>
      </div>
      {state === "error" && (
        <p id={`nl-${source}-err`} className={cn("mt-2 text-[12.5px]", light ? "text-[#e7a5a5]" : "text-error")} role="alert">
          {msg}
        </p>
      )}
      <p className={cn("mt-3 text-[11.5px]", light ? "text-ivory/45" : "text-faint")}>
        By subscribing you agree to our Privacy Policy. Unsubscribe at any time.
      </p>
    </form>
  );
}
