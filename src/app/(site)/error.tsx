"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow text-muted">Something went wrong</p>
      <h1 className="display-md mt-5 max-w-xl">Something went wrong. Please try again.</h1>
      <p className="mt-4 max-w-md text-[14.5px] text-muted">We’ve been notified and are looking into it. Your bag and wishlist are safe.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">Try Again</button>
        <Link href="/" className="btn btn-outline">Return Home</Link>
      </div>
      {error.digest && <p className="mt-6 text-[11px] text-faint">Reference: {error.digest}</p>}
    </section>
  );
}
