"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import { isEmail, isPhone } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { Check } from "@/components/ui/Icons";
import { FloatingInput } from "@/components/motion/FloatingField";

/** Query params read on demand (not useSearchParams) so these statically rendered forms never suspend or shift. */
const query = () => (typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search));

function safeNext(n: string | null) {
  // Only allow same-site relative redirects.
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/account";
}

function Field({ id, label, error, ...props }: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <FloatingInput id={id} label={label} error={error} {...props} />;
}

function PasswordField({ id, label, value, onChange, error, autoComplete }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="ffield">
        <input id={id} type={show ? "text" : "password"} placeholder=" " className="field pr-16" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
        <label htmlFor={id}>{label}</label>
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1 top-1/2 grid h-11 min-w-14 -translate-y-1/2 place-items-center px-3 text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { setUser, wishlist } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!isEmail(email)) err.email = "Enter a valid email address";
    if (!password) err.password = "Enter your password";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, wishlist }) })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    setLoading(false);
    if (!res.ok) return setErrors({ form: res.error, ...(res.fields ?? {}) });
    setUser(res.user);
    track({ name: "login" });
    router.push(safeNext(query().get("next")));
    router.refresh();
  };

  return (
    <>
      <p className="eyebrow text-muted">Welcome Back</p>
      <h1 className="display-md mt-4">Sign in</h1>
      <p className="mt-3 text-[14px] text-muted">
        New to Threads Wear?{" "}
        <Link href="/account/register" onClick={(e) => { const n = query().get("next"); if (n) { e.preventDefault(); router.push(`/account/register?next=${encodeURIComponent(n)}`); } }} className="link-static text-ink">
          Create an account
        </Link>
      </p>
      <form onSubmit={submit} noValidate className="mt-10 space-y-5">
        {errors.form && (
          <p role="alert" className="border-l-2 border-error bg-error/5 px-4 py-3 text-[13px] text-error">
            {errors.form}
          </p>
        )}
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" />
        <div className="flex justify-end">
          <Link href="/account/forgot-password" className="text-[12.5px] link-static">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p className="text-center text-[12px] text-faint">Demo account: arjun@threadswear.in · Threads@2026</p>
      </form>
      <div className="mt-10 border-t border-line pt-8 text-center">
        <p className="text-[13px] text-muted">Checking out without an account?</p>
        <Link href="/checkout" className="btn btn-outline btn-block mt-4">
          Continue as Guest
        </Link>
        <Link href="/track-order" className="mt-4 inline-block text-[12.5px] link-static">
          Track an order without signing in
        </Link>
      </div>
    </>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { setUser, wishlist } = useStore();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", newsletter: true });
  useEffect(() => {
    const email = query().get("email");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill from link (page is statically prerendered)
    if (email) setF((x) => (x.email ? x : { ...x, email }));
  }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const pwChecks = [
    { ok: f.password.length >= 8, label: "8+ characters" },
    { ok: /[A-Za-z]/.test(f.password), label: "A letter" },
    { ok: /\d/.test(f.password), label: "A number" },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (f.firstName.trim().length < 2) err.firstName = "Enter your first name";
    if (f.lastName.trim().length < 2) err.lastName = "Enter your last name";
    if (!isEmail(f.email)) err.email = "Enter a valid email address";
    if (f.phone && !isPhone(f.phone)) err.phone = "Enter a valid 10-digit mobile number";
    if (!pwChecks.every((c) => c.ok)) err.password = "Choose a stronger password";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, wishlist }) })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    setLoading(false);
    if (!res.ok) return setErrors({ form: res.error, ...(res.fields ?? {}) });
    setUser(res.user);
    track({ name: "sign_up" });
    router.push(safeNext(query().get("next")));
    router.refresh();
  };

  return (
    <>
      <p className="eyebrow text-muted">Join Threads Wear</p>
      <h1 className="display-md mt-4">Create an account</h1>
      <p className="mt-3 text-[14px] text-muted">
        Already a member?{" "}
        <Link href="/account/login" className="link-static text-ink">
          Sign in
        </Link>
      </p>
      <form onSubmit={submit} noValidate className="mt-10 space-y-5">
        {errors.form && (
          <p role="alert" className="border-l-2 border-error bg-error/5 px-4 py-3 text-[13px] text-error">
            {errors.form}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="firstName" label="First Name" autoComplete="given-name" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} error={errors.firstName} />
          <Field id="lastName" label="Last Name" autoComplete="family-name" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} error={errors.lastName} />
        </div>
        <Field id="email" label="Email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={errors.email} />
        <Field id="phone" label="Mobile (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} error={errors.phone} />
        <div>
          <PasswordField id="password" label="Password" value={f.password} onChange={(v) => setF({ ...f, password: v })} error={errors.password} autoComplete="new-password" />
          <ul className="mt-2 flex gap-4 text-[11.5px]">
            {pwChecks.map((c) => (
              <li key={c.label} className={c.ok ? "flex items-center gap-1 text-success" : "text-faint"}>
                {c.ok && <Check size={11} />} {c.label}
              </li>
            ))}
          </ul>
        </div>
        <label className="flex items-start gap-3 text-[13px] text-muted">
          <input type="checkbox" className="check mt-0.5" checked={f.newsletter} onChange={(e) => setF({ ...f, newsletter: e.target.checked })} />
          Send me private access to new collections and 10% off my first order.
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? "Creating account…" : "Create Account"}
        </button>
        <p className="text-[11.5px] text-faint">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="link-static">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="link-static">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [devLink, setDevLink] = useState<string | undefined>();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setError("Enter a valid email address");
    setError(null);
    setState("loading");
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    if (!res.ok) {
      setError(res.error);
      setState("idle");
      return;
    }
    setDevLink(res.devResetLink);
    setState("sent");
  };
  return (
    <>
      <p className="eyebrow text-muted">Account Help</p>
      <h1 className="display-md mt-4">Reset your password</h1>
      {state === "sent" ? (
        <div className="mt-8" role="status">
          <p className="text-[14.5px] leading-relaxed text-charcoal">If an account exists for <strong className="font-semibold">{email}</strong>, you’ll receive an email with a secure link to reset your password. The link is valid for 30 minutes.</p>
          {devLink && (
            <p className="mt-6 border border-dashed border-beige p-4 text-[12.5px] text-muted">
              Development mode — email delivery isn’t configured.{" "}
              <Link href={devLink} className="link-static text-ink">
                Open reset link
              </Link>
            </p>
          )}
          <Link href="/account/login" className="btn btn-outline btn-block mt-8">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-10 space-y-5">
          <p className="text-[14px] text-muted">Enter the email address on your account and we’ll send you a link to reset your password.</p>
          <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} />
          <button type="submit" disabled={state === "loading"} className="btn btn-primary btn-block">
            {state === "loading" ? "Sending…" : "Send Reset Link"}
          </button>
          <Link href="/account/login" className="block text-center text-[12.5px] link-static">
            Back to sign in
          </Link>
        </form>
      )}
    </>
  );
}

export function ResetForm() {
  const router = useRouter();
  const { refreshUser } = useStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- token lives in the URL
    setToken(query().get("token") ?? "");
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || !/\d/.test(password) || !/[A-Za-z]/.test(password)) return setError("Use 8+ characters with a letter and a number");
    setLoading(true);
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    setLoading(false);
    if (!res.ok) return setError(res.fields?.password ?? res.error);
    await refreshUser();
    router.push("/account");
  };
  if (token === null) return <div className="min-h-[280px]" aria-busy="true" />;
  if (!token)
    return (
      <>
        <h1 className="display-md">This link isn’t valid</h1>
        <p className="mt-4 text-[14px] text-muted">Please request a new password reset link.</p>
        <Link href="/account/forgot-password" className="btn btn-primary mt-8">
          Request New Link
        </Link>
      </>
    );
  return (
    <>
      <p className="eyebrow text-muted">Account Help</p>
      <h1 className="display-md mt-4">Choose a new password</h1>
      <form onSubmit={submit} noValidate className="mt-10 space-y-5">
        <PasswordField id="new-password" label="New Password" value={password} onChange={setPassword} error={error ?? undefined} autoComplete="new-password" />
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? "Saving…" : "Save Password & Sign In"}
        </button>
      </form>
    </>
  );
}
